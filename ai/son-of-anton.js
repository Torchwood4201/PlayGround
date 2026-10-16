/* ==========================================================================
   SonOfAnton — SAFE report-only code-health analyzer for the SNESBoy AI Lab.
   --------------------------------------------------------------------------
   Deliberate deviations from the pasted Node script:
   - NO `fs`, NO file deletion, NO auto-execute. It only SCORES text and
     returns preview strings. Nothing is written anywhere.
   - Browser-compatible: no `require`, attaches to `window.SonOfAnton`.
   - Same scoring idea (comment density, log/debug noise, dead-code lines),
     same 0.0–1.0 range, but thresholds only label rows (CLEAN / WATCH /
     BLOATED). Nothing is ever purged.
   ========================================================================== */
(function(){
  'use strict';

  function SonOfAnton(options){
    options = options || {};
    this.warnAt = typeof options.warnAt === 'number' ? options.warnAt : 0.1;
    this.bloatedAt = typeof options.bloatedAt === 'number' ? options.bloatedAt : 0.6;
    this.logHistory = [];
  }

  SonOfAnton.prototype.log = function(message){
    var entry = '[SON OF ANTON] ' + message;
    this.logHistory.push(entry);
    return entry;
  };

  SonOfAnton.prototype.evaluateInefficiency = function(name, content){
    var text = String(content || '');
    var lines = text.split('\n');
    if(lines.length === 0) return { name: name, score: 1.0, lines: 0, commentLines: 0, logStatements: 0, deadLines: 0, verdict: 'BLOATED' };
    var commentLines = 0, logStatements = 0, deadLines = 0;
    for(var i = 0; i < lines.length; i++){
      var trimmed = lines[i].trim();
      if(trimmed.indexOf('//') === 0 || trimmed.indexOf('/*') === 0 || trimmed.indexOf('*') === 0) commentLines++;
      if(trimmed.indexOf('console.log') !== -1 || trimmed.indexOf('debugger;') !== -1) logStatements++;
      if(trimmed === '{}' || trimmed === ';' || (/^var\s+\w+;$/.test(trimmed))) deadLines++;
    }
    var total = Math.min(((commentLines / lines.length) * 0.4 + (logStatements / lines.length) * 0.4 + (deadLines / lines.length) * 0.2) * 2.5, 1.0);
    var verdict = total >= this.bloatedAt ? 'BLOATED' : (total > this.warnAt ? 'WATCH' : 'CLEAN');
    return { name: name, score: Math.round(total * 100) / 100, lines: lines.length,
      commentLines: commentLines, logStatements: logStatements, deadLines: deadLines, verdict: verdict };
  };

  /* Read-only cleanup preview: returns what WOULD be stripped, never writes. */
  SonOfAnton.prototype.optimizePreview = function(content, maxLines){
    var out = String(content || '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .map(function(line){
        var cut = line.indexOf('//');
        if(cut === 0) return '';
        if(cut > 0 && line.indexOf('://') === -1) return line.slice(0, cut).trimEnd();
        return line.trimEnd();
      })
      .filter(function(line){ return line.trim().length > 0; })
      .join('\n');
    if(typeof maxLines === 'number' && maxLines > 0){
      out = out.split('\n').slice(0, maxLines).join('\n');
    }
    return out;
  };

  SonOfAnton.prototype.analyzeAll = function(sources){
    var self = this;
    return (sources || []).map(function(s){ return self.evaluateInefficiency(s.name, s.content); });
  };

  if(typeof window !== 'undefined') window.SonOfAnton = SonOfAnton;
  if(typeof module !== 'undefined' && module.exports) module.exports = SonOfAnton;
})();
