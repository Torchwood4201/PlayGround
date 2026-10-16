/* ==========================================================================
   Son of Anton — general-purpose planning + learning core.
   --------------------------------------------------------------------------
   This is NOT a code tool. It knows nothing about code, calendars, games,
   or files. Each capability supplies its own actions, conditions, scoring,
   and progress measure; the core only searches for plans, runs approved
   actions, records outcomes, and learns action preferences from feedback.

   Pattern per goal:
     Goal → state → actions → predicted outcomes → plan → approved
     execution → observed result → memory + feedback.

   Explicit limits: knowledge comes from the registered capabilities;
   planning is bounded by maxDepth/beamWidth; feedback tunes preferences,
   it does not invent new concepts. Memory is in-process unless the host
   persists it. No external AI services are used anywhere in this file.

   A code-health capability (the previous report-only analyzer, unchanged
   in behavior) ships below as ONE optional capability, alongside a tasks
   example. Nothing here reads, writes, or deletes host files.
   ========================================================================== */
(function(){
  'use strict';

  function clone(value){
    try{
      if(typeof structuredClone === 'function') return structuredClone(value);
    }catch(e){}
    return JSON.parse(JSON.stringify(value));
  }

  function SonOfAnton(options){
    options = options || {};
    this.maxDepth = (typeof options.maxDepth === 'number') ? options.maxDepth : 8;
    this.beamWidth = (typeof options.beamWidth === 'number') ? options.beamWidth : 20;
    this.learningRate = (typeof options.learningRate === 'number') ? options.learningRate : 0.15;
    this.capabilities = {};
    this.preferences = {};
    this.memory = [];
  }

  SonOfAnton.prototype.register = function(name, capability){
    if(!capability || typeof capability.score !== 'function' ||
       typeof capability.satisfied !== 'function' || !Array.isArray(capability.actions)){
      throw new Error('A capability needs score(), satisfied(), and actions[].');
    }
    for(var i = 0; i < capability.actions.length; i++){
      var action = capability.actions[i];
      if(!action || typeof action.name !== 'string' || typeof action.predict !== 'function'){
        throw new Error('Each action needs a name and predict().');
      }
    }
    this.capabilities[name] = capability;
    return this;
  };

  SonOfAnton.prototype.getCapability = function(name){
    var capability = this.capabilities[name];
    if(!capability) throw new Error('Unknown capability: ' + name);
    return capability;
  };

  SonOfAnton.prototype.preferenceKey = function(domain, action){
    return JSON.stringify([domain, action]);
  };

  SonOfAnton.prototype.rank = function(domain, capability, node, goal){
    var progress = capability.score(node.state, goal);
    if(!Number.isFinite(progress)) throw new Error('score() must return a finite number.');
    var preference = 0;
    for(var i = 0; i < node.steps.length; i++){
      var key = this.preferenceKey(domain, node.steps[i].action);
      preference += (key in this.preferences) ? this.preferences[key] : 0;
    }
    return progress - node.cost + preference;
  };

  SonOfAnton.prototype.plan = function(job){
    var domain = job.domain, state = job.state, goal = job.goal;
    var capability = this.getCapability(domain);
    var self = this;
    var initial = { state: clone(state), steps: [], cost: 0 };
    var frontier = [initial];
    var best = initial;
    for(var depth = 0; depth < this.maxDepth; depth++){
      var candidates = [];
      for(var f = 0; f < frontier.length; f++){
        var node = frontier[f];
        if(capability.satisfied(node.state, goal)){
          return self.describePlan(domain, goal, node, true);
        }
        for(var a = 0; a < capability.actions.length; a++){
          var action = capability.actions[a];
          var paramSets = action.parameters
            ? action.parameters(clone(node.state), clone(goal))
            : [{}];
          for(var p = 0; p < paramSets.length; p++){
            var params = paramSets[p];
            if(action.allowed && !action.allowed(clone(node.state), clone(params), clone(goal))) continue;
            /* Prediction must not perform real-world operations. */
            var predicted = action.predict(clone(node.state), clone(params), clone(goal));
            var cost = (action.cost === undefined) ? 1 : action.cost;
            if(!Number.isFinite(cost) || cost < 0){
              throw new Error('Action cost must be finite and nonnegative.');
            }
            var steps = node.steps.concat([{ action: action.name, params: clone(params) }]);
            candidates.push({ state: predicted, cost: node.cost + cost, steps: steps });
          }
        }
      }
      if(!candidates.length) break;
      candidates.sort(function(x, y){
        return self.rank(domain, capability, y, goal) - self.rank(domain, capability, x, goal);
      });
      var solved = null;
      for(var s = 0; s < candidates.length; s++){
        if(capability.satisfied(candidates[s].state, goal)){ solved = candidates[s]; break; }
      }
      if(solved) return self.describePlan(domain, goal, solved, true);
      if(self.rank(domain, capability, candidates[0], goal) >
         self.rank(domain, capability, best, goal)) best = candidates[0];
      frontier = candidates.slice(0, self.beamWidth);
    }
    return self.describePlan(domain, goal, best, false);
  };

  SonOfAnton.prototype.describePlan = function(domain, goal, node, predictedSuccess){
    return { domain: domain, goal: clone(goal), steps: clone(node.steps),
      predictedState: clone(node.state), predictedSuccess: predictedSuccess, cost: node.cost };
  };

  SonOfAnton.prototype.execute = function(job){
    var self = this;
    var plan = job.plan, state = job.state, approve = job.approve || function(){ return Promise.resolve(false); };
    var capability = self.getCapability(plan.domain);
    var chain = Promise.resolve({ current: clone(state), completed: [] });
    plan.steps.forEach(function(step){
      chain = chain.then(function(acc){
        var action = null;
        for(var i = 0; i < capability.actions.length; i++){
          if(capability.actions[i].name === step.action) action = capability.actions[i];
        }
        if(!action) throw new Error('Unknown action: ' + step.action);
        if(action.allowed && !action.allowed(clone(acc.current), clone(step.params), clone(plan.goal))){
          throw new Error('Conditions changed before ' + step.action + '; replan required.');
        }
        if(!action.execute){
          /* Actions without execute() only update simulated state. */
          return { current: action.predict(clone(acc.current), clone(step.params), clone(plan.goal)),
            completed: acc.completed.concat([clone(step)]) };
        }
        /* Real effects require approval of this exact action. */
        return Promise.resolve(approve({ domain: plan.domain, action: step.action,
          params: clone(step.params), state: clone(acc.current) })).then(function(approved){
          if(approved !== true) throw new Error('Not approved: ' + step.action);
          /* Return observed state, not merely predicted success. */
          return Promise.resolve(action.execute(clone(acc.current), clone(step.params), clone(plan.goal)))
            .then(function(observed){
              return { current: observed, completed: acc.completed.concat([clone(step)]) };
            });
        });
      });
    });
    return chain.then(function(acc){
      var result = { domain: plan.domain, goal: clone(plan.goal), state: clone(acc.current),
        completed: acc.completed, success: capability.satisfied(acc.current, plan.goal) };
      self.memory.push(clone(result));
      return result;
    });
  };

  SonOfAnton.prototype.feedback = function(domain, action, reward){
    if(!Number.isFinite(reward) || reward < -1 || reward > 1){
      throw new Error('Reward must be between -1 and 1.');
    }
    var key = this.preferenceKey(domain, action);
    var previous = (key in this.preferences) ? this.preferences[key] : 0;
    this.preferences[key] = previous + this.learningRate * (reward - previous);
  };

  /* ---------- code-health capability (report-only, never modifies files) ---
     The previous analyzer, preserved as one optional capability: scores
     comment density, log/debug noise, and dead-code lines on a 0.0–1.0
     scale. Thresholds only label rows. */
  SonOfAnton.scoreContent = function(content, opts){
    opts = opts || {};
    var warnAt = (typeof opts.warnAt === 'number') ? opts.warnAt : 0.1;
    var bloatedAt = (typeof opts.bloatedAt === 'number') ? opts.bloatedAt : 0.6;
    var lines = String(content || '').split('\n');
    if(!lines.length) return { score: 1.0, lines: 0, commentLines: 0, logStatements: 0, deadLines: 0, verdict: 'BLOATED' };
    var commentLines = 0, logStatements = 0, deadLines = 0;
    for(var i = 0; i < lines.length; i++){
      var trimmed = lines[i].trim();
      if(trimmed.indexOf('//') === 0 || trimmed.indexOf('/*') === 0 || trimmed.indexOf('*') === 0) commentLines++;
      if(trimmed.indexOf('console.log') !== -1 || trimmed.indexOf('debugger;') !== -1) logStatements++;
      if(trimmed === '{}' || trimmed === ';' || (/^var\s+\w+;$/.test(trimmed))) deadLines++;
    }
    var total = Math.min(((commentLines / lines.length) * 0.4 +
      (logStatements / lines.length) * 0.4 + (deadLines / lines.length) * 0.2) * 2.5, 1.0);
    return { score: Math.round(total * 100) / 100, lines: lines.length,
      commentLines: commentLines, logStatements: logStatements, deadLines: deadLines,
      verdict: total >= bloatedAt ? 'BLOATED' : (total > warnAt ? 'WATCH' : 'CLEAN') };
  };

  /* Capability over file NAMES (not contents): plans coverage of a report
     run. Contents are scored afterwards by the host via scoreContent. */
  SonOfAnton.codeHealth = function(names){
    names = names || [];
    return {
      score: function(state){ return state.reported.length; },
      satisfied: function(state, goal){
        for(var i = 0; i < goal.reported.length; i++){
          if(state.reported.indexOf(goal.reported[i]) === -1) return false;
        }
        return true;
      },
      actions: [{
        name: 'reportFile',
        cost: 0.1,
        parameters: function(state){
          var out = [];
          for(var i = 0; i < state.files.length; i++){
            if(state.reported.indexOf(state.files[i]) === -1) out.push({ name: state.files[i] });
          }
          return out;
        },
        allowed: function(state, params){ return state.reported.indexOf(params.name) === -1; },
        predict: function(state, params){ state.reported.push(params.name); return state; }
      }]
    };
  };

  /* ---------- tasks example (dependency + time-budget planning) ------------ */
  SonOfAnton.tasksExample = function(){
    return {
      score: function(state, goal){
        var total = 0;
        for(var i = 0; i < state.tasks.length; i++){
          var t = state.tasks[i];
          if(t.done && goal.required.indexOf(t.id) !== -1) total += t.value;
        }
        return total;
      },
      satisfied: function(state, goal){
        for(var r = 0; r < goal.required.length; r++){
          var ok = false;
          for(var i = 0; i < state.tasks.length; i++){
            if(state.tasks[i].id === goal.required[r] && state.tasks[i].done){ ok = true; break; }
          }
          if(!ok) return false;
        }
        return true;
      },
      actions: [{
        name: 'completeTask',
        cost: 0.1,
        parameters: function(state){
          var out = [];
          for(var i = 0; i < state.tasks.length; i++){
            if(!state.tasks[i].done) out.push({ id: state.tasks[i].id });
          }
          return out;
        },
        allowed: function(state, params){
          var task = null, i, j;
          for(i = 0; i < state.tasks.length; i++){
            if(state.tasks[i].id === params.id) task = state.tasks[i];
          }
          if(!task || task.done || task.minutes > state.minutesRemaining) return false;
          for(j = 0; j < task.requires.length; j++){
            var met = false;
            for(i = 0; i < state.tasks.length; i++){
              if(state.tasks[i].id === task.requires[j] && state.tasks[i].done){ met = true; break; }
            }
            if(!met) return false;
          }
          return true;
        },
        predict: function(state, params){
          for(var i = 0; i < state.tasks.length; i++){
            if(state.tasks[i].id === params.id){
              state.tasks[i].done = true;
              state.minutesRemaining -= state.tasks[i].minutes;
            }
          }
          return state;
        }
      }]
    };
  };

  if(typeof window !== 'undefined') window.SonOfAnton = SonOfAnton;
  if(typeof module !== 'undefined' && module.exports) module.exports = { SonOfAnton: SonOfAnton };

  /* Node demo (tasks with dependencies + time budget). Browser-safe: guarded.
     Run with: node ai/son-of-anton.js */
  if(typeof require !== 'undefined' && require.main === module){
    var anton = new SonOfAnton();
    anton.register('tasks', SonOfAnton.tasksExample());
    var plan = anton.plan({
      domain: 'tasks',
      state: { minutesRemaining: 90, tasks: [
        { id: 'research', minutes: 25, value: 3, requires: [], done: false },
        { id: 'draft', minutes: 40, value: 6, requires: ['research'], done: false },
        { id: 'review', minutes: 15, value: 4, requires: ['draft'], done: false }
      ] },
      goal: { required: ['research', 'draft', 'review'] }
    });
    console.log(JSON.stringify(plan, null, 2));
  }
})();
