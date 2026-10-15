const TRACKS = [
  {id:'UEO6uyczDMk',badge:'LATEST', cat:'originals', title:"Funky Town", dur:'3:05', views:9},
  {id:'xQZUjCSx9v4', cat:'remixes', title:"Block Rocking Firestarter", dur:'3:12', views:12},
  {id:'AdqOXNrHr8o', cat:'originals', title:"Captain G.Capacitor", dur:'3:51', views:12},
  {id:'OvcsrY8ksvI', cat:'originals', title:"Dance", dur:'4:32', views:17},
  {id:'XMdR8emp_cQ', cat:'remixes', title:"Rakins (Hey Boy, Hey Girl, Hrader, Better, Faster, Satisfaction.)", dur:'4:09', views:12},
  {id:'b2cZX9yMcco', cat:'beats', title:"Had To Go (NujaFlow)", dur:'3:24', views:12},
  {id:'KvK_pMvFV94', cat:'flips', title:"Aquatic Ambience - (Hip Hop/Trap Remix)", dur:'5:57', views:27},
  {id:'Wb6AauUjceM', cat:'flips', title:"SHAQ FU (EXTENDED REMASTER)", dur:'2:40', views:9},
  {id:'IiEcpi-ANc4', cat:'originals', title:"Break", dur:'7:21', views:5},
  {id:'0uN1dCu0iDE', cat:'originals', title:"Jazzed Up", dur:'6:48', views:7},
  {id:'voJZJmEvd2g', cat:'remixes', title:"itachi Uchiha", dur:'4:16', views:43},
  {id:'_lqXKH8YWNY', cat:'originals', title:"Weirdmageddon", dur:'3:30', views:10},
  {id:'iWDEqFFZK3s',badge:'TYPE BEAT', cat:'beats', title:"Pac Man (Tyler the Creator type beat)", dur:'4:03', views:37},
  {id:'cGuNRYCcjCo', cat:'remixes', title:"M is for Max (Headroom EDM)", dur:'5:31', views:19},
  {id:'jhrt-f9Z-rM', cat:'originals', title:"Fight to Face", dur:'2:58', views:17},
  {id:'ZIX_XGPy64U', cat:'flips', title:"Klax Amiga (Re-Mix)", dur:'2:38', views:28},
  {id:'9XMMrZi20zA', cat:'remixes', title:"Sweet Brother Funk Soul", dur:'2:32', views:37},
  {id:'TQzpwgzwW4Y', cat:'flips', title:"Jet Set Bumble", dur:'5:30', views:36},
  {id:'54DIDKHmqDQ', cat:'originals', title:"Everybody Teachers Around", dur:'3:14', views:15},
  {id:'1LMst8ovXlw', cat:'remixes', title:"Daft Prydz", dur:'4:08', views:19},
  {id:'nUwwnRiKw-k',badge:'EPIC', cat:'flips', title:"Dr.Gerald Robotnik", dur:'7:52', views:14},
  {id:'mQd45iUCxFE', cat:'remixes', title:"Daft Voltage", dur:'3:26', views:10},
  {id:'2rWDeE_mngc', cat:'remixes', title:"Composite Devices", dur:'3:51', views:20},
  {id:'sEPGWmxvXXw', cat:'flips', title:"Chemical Plant Zone 2.0", dur:'4:25', views:12},
  {id:'nVpb879Qinc', cat:'remixes', title:"Magique 2.0", dur:'3:59', views:25},
  {id:'k6SU-jkF2Ks', cat:'flips', title:"Koopahari Desert", dur:'3:59', views:18},
  {id:'Fma74rHnWdo', cat:'beats', title:"102 Rap", dur:'3:59', views:16},
  {id:'SFJY6957j4E', cat:'originals', title:"Piece By Piece (Dreams For A Price)", dur:'5:13', views:16},
  {id:'BAiGJ8Tkob4', cat:'originals', title:"Need A Dollar", dur:'4:04', views:11},
  {id:'sswM4oASom8', cat:'beats', title:"Falling Rain", dur:'2:31', views:24},
  {id:'iBIraLyM6YQ', cat:'originals', title:"The Toclafane", dur:'5:16', views:63},
  {id:'2kYxnMWP0Go', cat:'remixes', title:"Critters Buggin' - Naked Truth (Remix)", dur:'4:18', views:43},
  {id:'BoYQAanhAmk', cat:'originals', title:"Fulcrum Point", dur:'6:24', views:23},
  {id:'Umro-inRsxY', cat:'flips', title:"All I Do Is Boogerman", dur:'3:53', views:114},
  {id:'4SX7V924UVY', cat:'flips', title:"Bart's Nightmare - Dream Street (Re Pro)", dur:'4:00', views:180},
  {id:'XBKeTuhlMzQ', cat:'originals', title:"Narceus", dur:'2:28', views:10},
  {id:'HoLPlFd4cac', cat:'originals', title:"Hard Work, No Glory", dur:'2:37', views:6},
  {id:'U7CjmLNwNjY', cat:'originals', title:"A Beez Kneez", dur:'3:18', views:17},
  {id:'4SMLcyWGhe4', cat:'originals', title:"Shadow of The Goat", dur:'4:01', views:5},
  {id:'4_o49CZl_kA', cat:'originals', title:"Eyes of Vanta", dur:'3:24', views:14},
  {id:'dQ1kmA41Vlk', cat:'originals', title:"Got The Fever", dur:'3:33', views:8},
  {id:'qvCmPocLi3Q', cat:'flips', title:"By Finn The Human", dur:'3:59', views:5},
  {id:'nJnBNqs3wy8', cat:'beats', title:"Foxy - Party Boys (DnB Only)", dur:'6:03', views:20},
  {id:'XIdP6yCpcHk', cat:'flips', title:"Ballad of Red Harlow", dur:'3:39', views:30},
  {id:'7pc4AuUMH7g', cat:'originals', title:"Bathed In Blood (Dexter)", dur:'4:00', views:13},
  {id:'ieWRbrLAkLM', cat:'originals', title:"WE ARE ALL ROBOTS!", dur:'5:55', views:37},
  {id:'4qgYGNGiDt8', cat:'originals', title:"You Baby", dur:'5:11', views:16},
  {id:'gK7TqQXlipg', cat:'originals', title:"Shattered Boards and Broken Dreams (Showed Him My C*@k)", dur:'2:11', views:11},
  {id:'BCSJIb6BKk0', cat:'originals', title:"Jackin' it in San Diego", dur:'2:11', views:32},
  {id:'fK385iZJkZw', cat:'originals', title:"John Reverie", dur:'4:05', views:49},
  {id:'TreSBNeA3b0', cat:'originals', title:"Back-up Data (Beta 4)", dur:'5:27', views:20},
  {id:'I_PK3o6mqYw', cat:'originals', title:"NO NO NO! TURN OFF THOSE LIGHTS!", dur:'4:13', views:23},
  {id:'t1K8kK1D1kA', cat:'originals', title:"Jiraiya Attacks", dur:'3:37', views:97},
  {id:'faNULfKshIo', cat:'remixes', title:"Scents You Can't Forget (Herbal Essences)", dur:'2:05', views:13},
  {id:'bVuGBNzlrY4', cat:'remixes', title:"Bones Of Sins (Meat Puppet)", dur:'3:46', views:31},
  {id:'YNf5NJtSB4Q', cat:'originals', title:"IS THIS JUST EMINEM??", dur:'5:30', views:73},
  {id:'MvbVy0XDZCc', cat:'originals', title:"SO ANYWAY, I STARTED BLASTING! Ft Danny DeVito", dur:'4:43', views:66},
  {id:'VK1EGdaaO94', cat:'originals', title:"A Little City", dur:'4:34', views:17},
  {id:'JY5tiE6Hbtc', cat:'originals', title:"Pitz Crackers", dur:'4:13', views:15},
  {id:'sSkBkJvQz74', cat:'originals', title:"STOP IT WITH THE F@#$ING GUN PLAY!!", dur:'3:41', views:25},
  {id:'fXJY2v5ulS4', cat:'originals', title:"Stank Face", dur:'3:51', views:10},
  {id:'A6jcxWH6YnI', cat:'originals', title:"I Am Man?", dur:'4:06', views:10},
  {id:'5-cIHWcZmkA', cat:'originals', title:"What is the name of your technique?", dur:'3:05', views:15},
  {id:'Ke4OG9KUJdA', cat:'originals', title:"Please don't flush anything except for small amounts of toilet paper", dur:'5:41', views:27},
  {id:'SGPdm3lzBdY', cat:'flips', title:"Super Buu (Gotenks Absorbed)", dur:'2:41', views:16},
  {id:'YUk1aLRMqqk', cat:'originals', title:"Pirate's Ball", dur:'4:56', views:16},
  {id:'TcdvYFi_upw', cat:'originals', title:"Laser Sharks", dur:'4:01', views:14},
  {id:'IvssG2j51Po', cat:'originals', title:"Dark Crusader", dur:'4:34', views:43},
  {id:'uPAxNGhUDYk', cat:'remixes', title:"Do you want Daft Rasputin 909", dur:'2:53', views:149},
  {id:'kL9ibNvw4D0', cat:'originals', title:"Error 404", dur:'4:35', views:16},
  {id:'RNDHFlIhg6A', cat:'beats', title:"Is that drill enough for you?", dur:'4:11', views:12},
  {id:'AakmC3gsDNc', cat:'originals', title:"Crows Night", dur:'4:34', views:9},
  {id:'Y4Mx24Z1l8g', cat:'originals', title:"Well that's a loop", dur:'4:22', views:7},
  {id:'Lv31S0wwu_g', cat:'originals', title:"if i knew what i was doing would i post this?", dur:'4:46', views:3},
  {id:'oBGyxG_v1Ys', cat:'originals', title:"Upon a day", dur:'3:43', views:15},
  {id:'K6vB0fdPhJo', cat:'originals', title:"I have no idea what to call this but I'm uploading it anyway.", dur:'6:52', views:32},
  {id:'bSgKwe3JTWU', cat:'originals', title:"False Prophets", dur:'4:24', views:17},
  {id:'Rr9lVBEqL_I', cat:'originals', title:"tdsrygvghkvbhyjgtd", dur:'4:41', views:36},
  {id:'Lq8z1-eXrRE', cat:'beats', title:"There I Made Grime", dur:'3:45', views:11},
  {id:'JnL16a-0r6M', cat:'originals', title:"doo doo head", dur:'3:32', views:11},
  {id:'icrsHO4AtNU', cat:'originals', title:"Master", dur:'5:18', views:29},
  {id:'dgQ7CrcVx1g', cat:'originals', title:"NOT THE BEEZZ", dur:'4:51', views:12},
  {id:'yufswN_aVqM', cat:'originals', title:"Dr. Beaker, Ph.D", dur:'4:55', views:29},
  {id:'V5JJYvU7IXE', cat:'flips', title:"Ivo Robotnik (Eggman)", dur:'7:30', views:13},
  {id:'fLD99ZlcHm8', cat:'originals', title:"022524144", dur:'5:55', views:12},
  {id:'bUSrPLkANvY', cat:'originals', title:"Attack!", dur:'4:04', views:15},
  {id:'ziFS1Zx1NoI', cat:'flips', title:"Technodrome", dur:'5:13', views:16},
  {id:'89JLb17ml4g', cat:'originals', title:"Mission to Earth", dur:'8:15', views:39},
  {id:'7j5k8eUQ3yI', cat:'originals', title:"L=W=Cl*.5*r*V^2*A", dur:'3:31', views:18},
  {id:'bTxEeB5jdWY', cat:'originals', title:"Surezno", dur:'5:26', views:15},
  {id:'yGFFR3soST0', cat:'originals', title:"MHPS_KOTO_WINTERMOON", dur:'4:37', views:25},
  {id:'Uyj5tp-NLXw', cat:'originals', title:"Yeah Dance", dur:'6:41', views:17},
  {id:'u_p_1y-z2P8', cat:'remixes', title:"Soulful Night Anthem", dur:'4:31', views:63},
  {id:'xApinRC6N58', cat:'originals', title:"4RX-PR0", dur:'4:35', views:16},
  {id:'QHUpdAxYhJs', cat:'remixes', title:"Super Star Dj's", dur:'3:13', views:31},
  {id:'LcQh-O8eKJk', cat:'originals', title:"La Yeah!", dur:'5:08', views:14},
  {id:'PHeLZUx9Uc0', cat:'originals', title:"In Your House by", dur:'4:22', views:16},
  {id:'07U6EsuQcP0', cat:'remixes', title:"Fantastic Lady", dur:'4:14', views:47},
  {id:'vWKQDKw4qF8', cat:'remixes', title:"Soul Train (Re-Mix)", dur:'3:16', views:301},
  {id:'vq7BsfUmF_A', cat:'originals', title:"I'm a peice of shit!!", dur:'3:20', views:14},
  {id:'5tG5t4Z4tgY', cat:'originals', title:"Reminisce", dur:'5:12', views:11},
  {id:'Zcra4F3wqMc', cat:'originals', title:"Delusional", dur:'5:05', views:15},
  {id:'1jXBK7bQxXw', cat:'originals', title:"Ancient Market.", dur:'5:38', views:24},
  {id:'p6SP7Jt9y9A', cat:'remixes', title:"Turtle Power Remix", dur:'4:13', views:52},
  {id:'AqHZhj5qKig', cat:'flips', title:"Dance Odyssey", dur:'6:17', views:40},
  {id:'C8e29ojm248', cat:'originals', title:"Butter Flavored Topping", dur:'4:22', views:61},
  {badge:'FAN FAVE',id:'cjxXHD8htYY', cat:'flips', title:"Odyssey", dur:'3:55', views:1300},
  {id:'n1Na1oIDYkc', cat:'originals', title:"Playboy Playin Tricks on Ya", dur:'3:33', views:63},
  {id:'fMRfVmM7f9Q', cat:'originals', title:"Moog City", dur:'5:08', views:46},
  {id:'HSe6qncN5Vg', cat:'originals', title:"75.20.05.4", dur:'3:52', views:35},
  {id:'lQlWaQ2afdc', cat:'originals', title:"Crows", dur:'4:29', views:73},
  {id:'hemwpeqeb1w', cat:'originals', title:"In A Blink", dur:'3:07', views:92},
  {id:'fjXfdpFysXY', cat:'originals', title:"Dap", dur:'3:34', views:20},
  {id:'Vp5keCF4jrE', cat:'originals', title:"Hard AF", dur:'3:52', views:129},
  {id:'ylelmfNDmyw', cat:'originals', title:"45th", dur:'4:22', views:24},
  {id:'DpS5I5QZeDE', cat:'originals', title:"\u200d", dur:'2:06', views:18},
  {id:'0aW9Y7nl1M0', cat:'originals', title:"DKSO", dur:'5:11', views:24},
  {id:'QNEQdpbZjSc', cat:'originals', title:"New Year New Me!", dur:'4:11', views:16},
  {id:'MCwnMtwxzpM', cat:'originals', title:"24", dur:'2:07', views:34},
  {id:'u2OikNGMBQY', cat:'originals', title:"Song of Nibiru", dur:'3:48', views:24},
  {id:'sgue_CsmEmQ', cat:'flips', title:"Podoboo", dur:'8:15', views:12},
  {id:'B5RFmzlhXcc', cat:'originals', title:"122423", dur:'2:12', views:26},
  {id:'uQV4NKqlctQ', cat:'originals', title:"$3500", dur:'4:12', views:13},
  {id:'6Ux6UlK0BqE', cat:'originals', title:"Dusk", dur:'7:03', views:18},
  {id:'-Fij8eb3Zk0', cat:'originals', title:"List of Krampus", dur:'2:23', views:22},
  {id:'os7fCqpb3bQ', cat:'flips', title:"Tetris Part 2", dur:'6:46', views:17},
  {id:'1EY7uQNEMDc', cat:'flips', title:"Tetris Part 1", dur:'5:25', views:15},
  {id:'XH-znx0yj1Y', cat:'originals', title:"Manic Voltage", dur:'7:23', views:23},
  {id:'uFgle0mMzx0', cat:'flips', title:"The Amazing Mirror", dur:'4:30', views:19},
  {id:'ZdJAX-zfXro', cat:'remixes', title:"Badman's Preacher (Re-Dub)", dur:'3:50', views:16},
  {id:'Lv398RMSpRI', cat:'remixes', title:"Intergalactic Magique", dur:'3:19', views:29},
  {id:'WHFgU53hsyc', cat:'beats', title:"Homeless Prince - The Projects (Fat Beat) (Instrumental)", dur:'4:30', views:59},
  {id:'R5zGJaQPyEE', cat:'originals', title:"Washy Washy", dur:'7:16', views:12},
  {id:'cR1xDhFZoxg', cat:'beats', title:"The Zealots - Errors In The Era (Instrumental)", dur:'4:33', views:37},
  {id:'8ZG3Hm2iIiE', cat:'originals', title:"The Faces", dur:'4:01', views:12},
  {id:'4CGNEXRmGdM', cat:'originals', title:"Grym", dur:'3:05', views:13},
  {id:'Aoe_z8Nbg7Y', cat:'originals', title:"Quantum Flutes", dur:'2:45', views:13},
  {id:'HGXnbn8cl6I', cat:'originals', title:"Bleach", dur:'7:15', views:49},
  {id:'ukfEz2diARA', cat:'originals', title:"Bluenose", dur:'3:18', views:73},
  {id:'fR3Gt7-P8NE', cat:'originals', title:"11,10,23,12,16", dur:'2:52', views:14},
  {id:'8aplYt0OpwM', cat:'originals', title:"Echo", dur:'4:53', views:21},
  {id:'9YYpK3UIbFs', cat:'originals', title:"...", dur:'3:41', views:35},
  {id:'GXOGSZ-TeVY', cat:'originals', title:"The Ballad of Mr.Morgan", dur:'2:28', views:12},
  {id:'5LlIq2f5wTs', cat:'originals', title:"103- 123", dur:'3:32', views:13},
  {id:'Z6d6Z-Fopi8', cat:'originals', title:"Bass Guitar Center", dur:'3:52', views:13},
  {id:'Kmpom24IGlI', cat:'flips', title:"Dragon Ball Z: Budokai - Expectation (Extended & Rearranged)", dur:'4:22', views:543},
  {id:'mW8yFuu8S4U', cat:'originals', title:"EVERYTHING SOUNDS THE SAME!!!", dur:'4:56', views:83},
  {id:'wZbaDap5Z9o', cat:'flips', title:"Ghost Busters", dur:'3:54', views:30},
  {id:'zclk4LU4E-Q', cat:'originals', title:"Cherry Vanilla", dur:'2:32', views:17},
  {id:'SBv-aATOE5M', cat:'originals', title:"Stickin Around Theme (Rearranged)", dur:'3:59', views:85},
  {id:'dFaYOT4lCMs', cat:'remixes', title:"We Got The Funk", dur:'3:07', views:61},
  {id:'ejIDXJBRwKk', cat:'originals', title:"Unwelcome Discovery", dur:'2:28', views:49},
  {id:'ox-3AYpqiZM', cat:'originals', title:"Burial Ground", dur:'3:58', views:233},
  {id:'2s_QMjuun-U', cat:'originals', title:"Funeral March", dur:'5:01', views:13},
  {id:'TnjqXyvrzKk', cat:'remixes', title:"Funk Chameleon", dur:'2:47', views:295},
  {id:'5YCAG6pNcDs', cat:'remixes', title:"Magique", dur:'3:41', views:77},
  {id:'pGLMRp7Ap2s', cat:'remixes', title:"Trouble Man ( Drum's and Bass )", dur:'3:26', views:19},
  {id:'3OQRtGW4AIE', cat:'beats', title:"Scraching Red", dur:'3:35', views:18},
  {id:'x-b5Pp6i-H4', cat:'originals', title:"Something's Funky", dur:'5:27', views:22},
  {id:'lcJYzWYmlTI', cat:'beats', title:"Toejam and Earl 1991 Promo Rap (Instrumental)", dur:'6:15', views:145},
  {id:'HnWUvmqjx64', cat:'originals', title:"168.147.74 (Spumoni)", dur:'2:48', views:12},
  {id:'FwmXkXdGH-U', cat:'originals', title:"Humans", dur:'2:21', views:6},
  {id:'NNpoHlYdkbI', cat:'originals', title:"Education Connection", dur:'3:54', views:12},
  {id:'DqlNJVvZlkg', cat:'originals', title:"String's of Wind's", dur:'3:17', views:12},
  {id:'S_qFrUy6SWE', cat:'originals', title:"J ROC - Sweater Kitties", dur:'2:08', views:7},
  {id:'9uHSVNJLph4', cat:'originals', title:"New Car", dur:'2:21', views:17},
  {id:'0HwwuAhfddM', cat:'originals', title:"Alakazoobie!", dur:'3:24', views:14},
  {id:'osAmso7tzjs', cat:'originals', title:"Acajian", dur:'4:01', views:12},
  {id:'HzB0gUCSc2A', cat:'remixes', title:"Gorillaz - Tomorrow Comes Today Remix", dur:'3:15', views:121},
  {id:'GX8L-SUMLLY', cat:'originals', title:"Baby Jam", dur:'3:58', views:12},
  {id:'RMsCoMyJuAo', cat:'originals', title:"Ancient Heart", dur:'3:32', views:7},
  {id:'mHQtCCmII7A', cat:'remixes', title:"Rockit Multipliez - Herbie Hancock Vs K-Sobajima", dur:'2:59', views:69},
  {id:'NtL5q4gZ84U', cat:'originals', title:"Dun Dunt Dun Dunt Dunt Dun", dur:'2:59', views:28},
  {id:'bFLcSWXaP3M', cat:'originals', title:"WHO DAT LUMBERJACK", dur:'2:18', views:25},
  {id:'xGvS2WiSXiE', cat:'originals', title:"Da Funk Isolated Drums And Bass by Weird0Radi0", dur:'5:20', views:81},
  {id:'gQmqa6GE-cs', cat:'originals', title:"Stay Automatic.", dur:'3:05', views:6},
  {id:'CdslEcswyaU', cat:'originals', title:"Reveal Your Fun", dur:'3:04', views:28},
  {id:'n_ryfd5PEPU', cat:'originals', title:"What's A Record?", dur:'2:41', views:28},
  {id:'79H2ZeyKAGM', cat:'originals', title:"Lo _ SCI", dur:'3:30', views:18},
  {id:'R6M4x0tfJPc', cat:'originals', title:"Dragon Fly", dur:'4:09', views:11},
  {id:'Lfxx3k4kT0Y', cat:'flips', title:"The Twilight Zone (Re-Upload)", dur:'3:27', views:4},
  {id:'yJ28bv7FkCc', cat:'originals', title:"Dark and Stormy Night", dur:'2:46', views:22},
  {id:'mUo3C55bRwY', cat:'originals', title:"Pumpkin Head", dur:'3:56', views:23},
  {id:'6lHSAC3Roa0', cat:'flips', title:"BMO", dur:'3:38', views:17},
  {id:'I_OUCfwMYfs', cat:'originals', title:"Mooster Truck", dur:'5:21', views:13},
  {id:'sS-tFDh_K20', cat:'originals', title:"The Weird One", dur:'5:28', views:15},
  {id:'Fk9s0TD0RWs', cat:'originals', title:"Unidentifly", dur:'7:21', views:13},
  {id:'bsn1TOUnMaI', cat:'originals', title:"Abstract Mind", dur:'4:21', views:19},
  {id:'RvM2eeHV8bY', cat:'flips', title:"New Spider-Man", dur:'3:38', views:32},
  {id:'8l9IRLcnHcE', cat:'originals', title:"Ferminial Sun", dur:'3:19', views:13},
  {id:'vnnaRTi381w', cat:'originals', title:"Change of Plateau", dur:'6:00', views:18},
  {id:'rSCsmSy7Jk4', cat:'originals', title:"Cha Man!", dur:'2:57', views:25},
  {id:'hp-aMZ4D16o', cat:'originals', title:"Max Headroom", dur:'4:07', views:28},
  {id:'ul2hp7dd-cQ', cat:'originals', title:"Over Again", dur:'5:01', views:17},
  {id:'TdIjGI5gPmw', cat:'flips', title:"Skull Face", dur:'3:33', views:16},
  {id:'KzF-Hc72uqk', cat:'originals', title:"Lupo's Head", dur:'4:26', views:17},
  {id:'i2iw_KmnoQg', cat:'originals', title:"A shot of B 12", dur:'3:41', views:179},
  {id:'gDKraCZ2EmA', cat:'originals', title:"Plague.", dur:'4:26', views:16},
  {id:'Exeakyq09Rw', cat:'remixes', title:"Avicii Prydz", dur:'4:33', views:14},
  {id:'2bNLymFtsmE', cat:'flips', title:"Champloo", dur:'4:09', views:83},
  {id:'Ri9lxrc4z0I', cat:'originals', title:"Gnome's", dur:'5:22', views:11},
  {id:'Qvj8dMXgfq0', cat:'originals', title:"A Violin Sonata", dur:'8:20', views:18},
  {id:'w-DJ3dAznlI', cat:'originals', title:"Hawt Earfquake Blows (With more Penny Goodwin)", dur:'3:51', views:28},
  {id:'yV9Lp4MzdVI', cat:'originals', title:"For The Birds", dur:'4:13', views:15},
  {id:'U4z7Nuis1NY', cat:'flips', title:"New Junk City Remix", dur:'5:17', views:225},
  {id:'1CYcKgh4U2g', cat:'originals', title:"Bare Candour", dur:'5:01', views:21},
  {id:'b93hSfLRS_0', cat:'originals', title:"Neon Night", dur:'5:01', views:12},
  {id:'LpfGHMnr9Pc', cat:'remixes', title:"It\u2019s a Good Life If You Don\u2019t Weaken (Hip-hop Instrumental Cover)", dur:'4:42', views:36},
  {id:'z_VgqC8eblE', cat:'flips', title:"Space Timesplitters", dur:'4:06', views:23},
  {id:'RXCFQ01iafI', cat:'originals', title:"I'm freaking out man!", dur:'2:58', views:17},
  {id:'r2ANH0AchwQ', cat:'originals', title:"Radar", dur:'3:05', views:11},
  {id:'V7q-VsNGIKk', cat:'remixes', title:"Renegades of funk", dur:'3:17', views:468},
  {id:'lwBs6MdnX7I', cat:'originals', title:"Vibe", dur:'4:03', views:12},
  {id:'-dX_e7mrIZM', cat:'remixes', title:"Zombie", dur:'7:07', views:15},
  {id:'PKn2eBwFWo4', cat:'originals', title:"Pyramid of Fear", dur:'4:04', views:47},
  {badge:'FAN FAVE',id:'6Q9sK6vFums', cat:'flips', title:"The Warriors", dur:'5:50', views:1300},
  {badge:'FAN FAVE',id:'TEwxGQhHUkA', cat:'remixes', title:"Alphaville - Forever Young (Deep House Mix)", dur:'3:43', views:932},
  {id:'8HSOFeZDXZk', cat:'originals', title:"Funkitronica", dur:'4:08', views:48},
  {id:'3VgDbw_UzBY', cat:'originals', title:"Elliptic Curve", dur:'5:12', views:21},
  {id:'Jm28ZhUjBew', cat:'remixes', title:"Positive Exchange", dur:'4:13', views:33},
  {id:'c2BnV6kPbms', cat:'originals', title:"you're a cun-cun-cun", dur:'1:26', views:6},
  {id:'wCD22p9LEfA', cat:'originals', title:"Escape is at Hand for the Travelin' Man - The Tragically Hip (Drums Only)", dur:'5:48', views:34},
  {id:'icZhBqsENac', cat:'originals', title:"Close 2 U", dur:'3:01', views:29},
  {id:'TsRKCSEs9zA', cat:'flips', title:"Traputurama", dur:'2:40', views:17},
  {id:'KcviDzqoEH0', cat:'originals', title:"IBM Under $18'000", dur:'2:19', views:16},
  {id:'irkcn8Zi828', cat:'beats', title:"TPB Lofi", dur:'3:40', views:28},
  {id:'R28EOWKb0_8', cat:'originals', title:"Know What I'm Sayin?", dur:'2:24', views:23},
  {id:'bTlowAnogSE', cat:'originals', title:"Electro Pineapple", dur:'3:38', views:259},
  {id:'61R9r-ut3k4', cat:'flips', title:"Squidward's Clarinet", dur:'1:38', views:254},
  {id:'4dzBRDTY2u0', cat:'originals', title:"Journey To The Center Of The Basement.", dur:'5:08', views:139},
  {id:'XPH3J6pooYs', cat:'originals', title:"Physics", dur:'3:59', views:15},
  {id:'yfEhQemadZk', cat:'originals', title:"Belshazzar", dur:'3:54', views:15},
  {id:'2I2Q0M-qPhU', cat:'beats', title:"Liar - Trap Beat in D minor - 150BPM", dur:'2:48', views:28},
  {id:'uk0wPD9-I-I', cat:'originals', title:"Super Bombastic Waffles", dur:'4:08', views:19},
  {id:'Ub_hUs_7uP8', cat:'flips', title:"Land of Ooo", dur:'3:57', views:15},
  {id:'86SyuNXEebg', cat:'originals', title:"Blue Hamster Axel Joe", dur:'2:31', views:12},
  {id:'gvQ2odFLw4Y', cat:'flips', title:"Stickerbush Symphony", dur:'4:23', views:48},
  {id:'Krw4T302Y5c', cat:'beats', title:"Beat Craft", dur:'3:39', views:12},
  {id:'BKrCHwGczQs', cat:'flips', title:"Green Portals", dur:'4:41', views:11},
  {id:'eCDkrI-ZGjU', cat:'originals', title:"Song of Storms", dur:'5:46', views:49},
  {id:'y4xpNT2vRwk', cat:'originals', title:"Garbage", dur:'4:43', views:13},
  {id:'aJZFPzlO77k', cat:'originals', title:"Snow Monster of the North", dur:'2:59', views:17},
  {id:'JUp0UJrpfgY', cat:'originals', title:"Holidaze", dur:'3:48', views:800},
  {id:'5fmDzl4rqxQ', cat:'flips', title:"Golden Gun", dur:'2:30', views:21},
  {id:'DHUPTZTspco', cat:'originals', title:"Philibuster", dur:'5:31', views:12},
  {id:'6avJFur0Xdk', cat:'originals', title:"Rat Shit Bat Shit", dur:'3:36', views:100},
  {id:'dmNxgQ2puYQ', cat:'originals', title:"Singing Bowl", dur:'1:13', views:22},
  {id:'Q7MaPGGwFfI', cat:'originals', title:"The Norse Gods", dur:'4:17', views:12},
  {id:'6XKYFgtBYt4', cat:'remixes', title:"Human After All Instrumental", dur:'5:13', views:60},
  {id:'70vH5rNu4MA', cat:'originals', title:"Coral Caper", dur:'3:23', views:62},
  {id:'0Y0FPHLKsgI', cat:'originals', title:"Sinister", dur:'2:33', views:13},
  {id:'c83YrT4sGNg', cat:'originals', title:"Insomnia", dur:'3:34', views:13},
  {id:'GRaBBYutfzY', cat:'originals', title:"Wii Shop", dur:'5:15', views:74},
  {id:'MHyNAnCYeE8', cat:'flips', title:"Pokemon", dur:'3:13', views:15},
  {id:'YUWAQEHxaCI', cat:'originals', title:"Trip Pop.", dur:'2:01', views:11},
  {id:'DKfOSPXZDTI', cat:'originals', title:"Living Mice", dur:'4:27', views:40},
  {id:'ymoZsmkVZIE', cat:'originals', title:"Fire & Shine", dur:'4:23', views:11},
  {id:'TFc7cqQhKCQ', cat:'originals', title:"Got it Bad", dur:'3:07', views:12},
  {id:'_zbu7KH1L2w', cat:'originals', title:"Call Me On My Cell Phone?", dur:'4:17', views:12},
  {id:'cZqPl7c1Pm0', cat:'originals', title:"Mister G-Dubz", dur:'5:01', views:11},
  {id:'BkNYoQVNmsY', cat:'originals', title:"Hexadecinary", dur:'5:05', views:13},
  {id:'ldhoLdwoPhE', cat:'originals', title:"Nightmares and Night Terrors", dur:'5:09', views:11},
  {id:'_1CCMX-cGWg', cat:'originals', title:"Fire At Night", dur:'4:17', views:17},
  {id:'dLflPBOvAjg', cat:'originals', title:"Kamakura", dur:'4:17', views:19},
  {id:'WhaOd-das3k', cat:'flips', title:"Peach Butts", dur:'2:45', views:38},
  {id:'1PEngBsehfE', cat:'flips', title:"Age of Empires", dur:'2:13', views:13},
  {id:'kT-IaXOMPKc', cat:'flips', title:"Tallon IV", dur:'3:13', views:16},
  {id:'cKR1lIAoSOo', cat:'originals', title:"Doll Face", dur:'2:57', views:8},
  {id:'W0EycCx5A_Y', cat:'flips', title:"Star Power", dur:'2:53', views:12},
  {id:'mDkaAe3FTrU', cat:'originals', title:"Aero", dur:'1:59', views:11},
  {id:'h0HfBZ7gMT8', cat:'originals', title:"Purple Space", dur:'3:45', views:15},
  {id:'vXztsG1gzNU', cat:'originals', title:"Escort Thy Racket!", dur:'4:53', views:10},
  {id:'Hs0TWTyZTrc', cat:'originals', title:"Evil", dur:'2:30', views:8},
  {id:'oq-OazY1htU', cat:'originals', title:"Wrapping Paper", dur:'3:52', views:12},
  {id:'06bFi4dyTc8', cat:'originals', title:"Evil Ivan", dur:'3:49', views:17},
  {id:'6DSS_EryrX4', cat:'originals', title:"9 Circle's", dur:'2:57', views:11},
  {id:'v42GFhQE1tk', cat:'beats', title:"Break Dance", dur:'2:28', views:22},
  {id:'twsOo-lYwpk', cat:'beats', title:"Fucking Baked (Lil Dicky Inspired)", dur:'3:19', views:30},
  {id:'WA0FmiD7xlk', cat:'originals', title:"_ _ _ _ _ _", dur:'4:42', views:11},
  {id:'Y71RvDPLpt4', cat:'originals', title:"Seth MacFarlane", dur:'3:33', views:44},
  {id:'rgY3RrCepX4', cat:'originals', title:"Poop!", dur:'4:29', views:18},
  {id:'C0QMUMEPdRU', cat:'beats', title:"Yeah! - Reggaeton C Major - 98BPM", dur:'2:37', views:35},
  {id:'qFR4eSGhy-I', cat:'originals', title:"Eustace Bagge", dur:'2:57', views:26},
  {id:'0e0nBAP3eXk', cat:'originals', title:"Dr.Sleep", dur:'5:05', views:19},
  {id:'Or7dITxK_gQ', cat:'originals', title:"Ra of Nibiru", dur:'3:36', views:23},
  {id:'bdhNSTK4kMA', cat:'flips', title:"Springfield Tire Fire", dur:'2:59', views:932},
  {id:'9JepbxZ4E3M', cat:'originals', title:"Weird0Radi0", dur:'3:14', views:13},
  {id:'jYyqISeq72U', cat:'flips', title:"Tuxedo Mask (Revised)", dur:'2:33', views:13},
  {id:'vX5mtFzNp0c', cat:'originals', title:"Cloverfield", dur:'2:12', views:41},
  {id:'924JboJ8sOk', cat:'originals', title:"Bye Have a Beautiful Time", dur:'2:37', views:138},
  {id:'ZViXjJC7N2c', cat:'originals', title:"Shogun", dur:'2:18', views:7},
  {id:'nHIJ2yXnlnE', cat:'originals', title:"AnimE\u018emina", dur:'4:33', views:20},
  {id:'1zNUpEBo8qU', cat:'originals', title:"Self-Awareness", dur:'4:39', views:17},
  {id:'wusuFBofyfA', cat:'originals', title:"idk by Two Brothers", dur:'5:26', views:15},
  {id:'xBxaGYTsl9Y', cat:'originals', title:"Floral", dur:'4:33', views:13},
  {id:'cPWMennx0KY', cat:'originals', title:"Vapor", dur:'3:19', views:20},
  {id:'mfI2uJbdNDU', cat:'originals', title:"Ood", dur:'2:49', views:13},
  {id:'FS9AuRdL_70', cat:'originals', title:"99 99 99", dur:'4:33', views:16},
  {id:'FLaqSeKbEY8', cat:'flips', title:"Airship Fortress", dur:'2:48', views:38},
  {id:'zNanQAODnec', cat:'flips', title:"Broly", dur:'2:44', views:11},
  {id:'vAqA5sMtPVM', cat:'originals', title:"Shogun Assassin", dur:'3:25', views:41},
  {id:'uIIEei4jqrA', cat:'originals', title:"Survival", dur:'2:30', views:43},
  {id:'qnVuqdRBns8', cat:'originals', title:"Awake At Night", dur:'3:34', views:13},
  {id:'tfi4X3l9raw', cat:'originals', title:"Celina Recto", dur:'3:10', views:22},
  {id:'bcmAQ93wPyk', cat:'originals', title:"Myers", dur:'3:57', views:17},
  {id:'gmyWynCCTS4', cat:'originals', title:"OrCk 125BPM Cmin", dur:'3:07', views:45},
  {id:'aWqPjBqwLuc', cat:'originals', title:"SOUND", dur:'2:33', views:13},
  {id:'oH9ysKdZFBQ', cat:'originals', title:"Crackly B.S.", dur:'2:47', views:26},
  {id:'sVg_MCnFpcs', cat:'beats', title:"Noise 85 BPM E min", dur:'2:51', views:21},
  {id:'TAPn3EGcy44', cat:'beats', title:"Klip Klop Beat", dur:'4:10', views:12},
  {id:'aAUEKIGepDY', cat:'beats', title:"C-30 - West/South Style Beat Bb Min 135BPM", dur:'3:00', views:31},
  {id:'Ka8xd-Zzh0Y', cat:'beats', title:"Drill C# Maj 130bpm", dur:'2:37', views:37},
  {id:'CV9VO0-9bXk', cat:'beats', title:"FeelingIt - Trap Beat in G Minor - 158BPM by WeIrD0RaDi0", dur:'2:59', views:35},
  {id:'CjDbPKU705A', cat:'beats', title:"It's Like My Thumb Is My Cock (E Min 98 BPM)", dur:'2:43', views:38},
  {id:'43gn-2KknU4', cat:'beats', title:"Bayou Boogie- LoFi Beat in B\u266d Minor - 90BPM by WeIrD0RaDi0", dur:'2:33', views:17},
  {id:'KT52LiMmZ2Q', cat:'flips', title:"Shinobi Legions - Trip Hop Track in F Minor - 90BPM by WeIrD0RaDi0", dur:'3:14', views:15},
  {id:'13HT4cOkjOQ', cat:'originals', title:"The Darkness", dur:'5:15', views:23},
  {id:'JNuPZPe53fQ', cat:'originals', title:"Dare To Nightmare", dur:'7:32', views:24},
  {id:'B3h3WsO5Lc8', cat:'flips', title:"Sponge Chase", dur:'2:23', views:25},
  {id:'G5FHAmuzAho', cat:'flips', title:"Tuxedo Mask", dur:'2:36', views:14},
  {id:'rxZmFSrkizM', cat:'originals', title:"Dare To Dream", dur:'5:23', views:14},
  {id:'FmpG7m8zWVY', cat:'remixes', title:"Never Meant To Belong", dur:'5:29', views:52},
  {id:'f0728yiXuRE', cat:'flips', title:"Snow Wood Boarding School from EarthBound", dur:'3:19', views:39},
  {id:'w3mu92cXTaw', cat:'flips', title:"Pokemon Go OST Lead, bass and synth only", dur:'2:17', views:41},
  {id:'wnAk2ANE5YE', cat:'originals', title:"Classic (Model T)", dur:'4:20', views:15},
  {id:'Dm390KsaFVU', cat:'originals', title:"Dismal", dur:'4:36', views:16},
  {id:'k9sb9uaYITQ', cat:'flips', title:"Bowser", dur:'7:20', views:13},
  {id:'tL6mpDf8uZM', cat:'flips', title:"Mario 64,000", dur:'3:39', views:38},
  {id:'xqHgMGBiqlU', cat:'flips', title:"Majin", dur:'4:35', views:36},
  {id:'G5VWpCNUib0', cat:'flips', title:"Dire Dire Docks", dur:'3:09', views:20},
  {id:'rpDwVqp0IAo', cat:'flips', title:"Chemical Plant Zone", dur:'4:14', views:39},
  {id:'viPI4JZPlyE', cat:'beats', title:"Noodle Dance (HipHop)", dur:'4:26', views:25},
  {id:'SrwgSS8l4mE', cat:'originals', title:"By Ride", dur:'2:44', views:14},
  {id:'757zU6Xptp4', cat:'originals', title:"Misson China", dur:'3:05', views:14},
  {id:'-opEXUp8MNI', cat:'originals', title:"Dark Minds", dur:'3:48', views:14},
  {id:'QYlBOADJDvc', cat:'originals', title:"Check Action", dur:'4:07', views:12},
  {id:'oBFH-y1y5bM', cat:'originals', title:"Boxah In Wii Sports", dur:'3:08', views:22},
  {id:'nBVti-c10Yk', cat:'originals', title:"Elon", dur:'3:54', views:18},
  {id:'93HbmH_C99w', cat:'flips', title:"Melty Molten Galaxy", dur:'4:46', views:17},
  {id:'LMG6it0Gka4', cat:'originals', title:"NAUTICAL DISASTER (ELECTRONIC)", dur:'5:12', views:15},
  {id:'UcA6MSAZTno', cat:'originals', title:"Tap Tap - 120BPM", dur:'2:43', views:33},
  {id:'gg2LOuzBg_Y', cat:'originals', title:"BLAP-70BPM", dur:'3:23', views:19},
  {id:'qEFe5zTAhgE', cat:'originals', title:"Split", dur:'3:15', views:20},
  {id:'7vkR88fpFBY', cat:'originals', title:"Serotonin", dur:'4:26', views:12},
  {id:'70xFLjkB43I', cat:'flips', title:"Lil Mac", dur:'2:42', views:16},
  {id:'V9NqEHilI_o', cat:'originals', title:"Rye Toast", dur:'4:52', views:20},
  {id:'hF2JaGHYaOk', cat:'originals', title:"I Might Go Insane Tonight", dur:'3:33', views:16},
  {id:'qFvXaAmYq_s', cat:'originals', title:"Wedding Crashers", dur:'1:53', views:21},
  {id:'v4W89aZwZyg', cat:'flips', title:"Luigis Dark Humming", dur:'1:31', views:22},
  {id:'UfkJqcY61yA', cat:'originals', title:"I'm Through", dur:'2:39', views:21},
  {id:'G7akoc42_IM', cat:'originals', title:"Pumpkin Zone", dur:'3:53', views:24},
  {id:'li0uU3I12AY', cat:'originals', title:"Feeding Screams", dur:'4:21', views:30},
  {id:'dt62_jrOj-w', cat:'flips', title:"Prince Ali", dur:'3:40', views:82},
  {id:'NRfCOYn1POU', cat:'remixes', title:"Black Rabbit (White Rabbit Cover)", dur:'2:38', views:28},
  {id:'bXJLljBK5gw', cat:'originals', title:"Bathed In Blood (Dexter Blood OST)", dur:'2:30', views:26},
  {id:'5R4akYj5BQ4', cat:'flips', title:"Veridis Gerudo Loco", dur:'3:24', views:12},
  {id:'JsZfts33ScY', cat:'flips', title:"Nurse Joy", dur:'3:28', views:17},
  {id:'DIwZf0TDpvU', cat:'originals', title:"Epona Song (Lon Lon Ranch)", dur:'2:04', views:19},
  {id:'PwQfYub6bbc', cat:'originals', title:"Synth Symphony", dur:'6:11', views:18},
  {id:'84hiXxpLWbE', cat:'remixes', title:"One More Time by WeIrD0RaDi0", dur:'3:54', views:19},
  {id:'S93q8PzRUew', cat:'flips', title:"Requiem for a Dream", dur:'3:41', views:31},
  {id:'AfslMcVqYCI', cat:'flips', title:"Song Of Time.", dur:'3:07', views:19},
  {id:'pTNfdSZ-lx0', cat:'originals', title:"Mycorrhizae", dur:'2:47', views:14},
  {id:'9H68q3Gc5Ss', cat:'originals', title:"Aleister", dur:'3:17', views:12},
  {id:'juUtS5Iy6uQ', cat:'remixes', title:"In The Air Tonight (HipHop)", dur:'4:46', views:36},
  {id:'aTd0OT8NZPc', cat:'beats', title:"Rapper Rocket Master", dur:'2:10', views:30},
  {id:'OMwi806ODqs', cat:'originals', title:"Fission", dur:'2:30', views:15},
  {id:'Ee24ySm3EF4', cat:'flips', title:"Double Dragon Title Slowed", dur:'2:34', views:144},
  {id:'u8o5OamEA0w', cat:'remixes', title:"Eleanor Rigby (Hip Hop) by WeIrD0RaDi0", dur:'2:10', views:25},
  {id:'CWpB06SG2Do', cat:'flips', title:"Kid Chameleon", dur:'3:16', views:21},
  {id:'OOZuAP6LbSQ', cat:'flips', title:"Minecraft Sweden (HipHop)", dur:'3:38', views:57},
  {id:'8LO4YGpffUo', cat:'flips', title:"Futurama (EDM)", dur:'5:40', views:39},
  {id:'36oyyIN1vxc', cat:'remixes', title:"The Way I Am (scifi style) instrumental", dur:'4:49', views:14},
  {id:'RtftumNR840', cat:'originals', title:"Power", dur:'3:00', views:25},
  {id:'riT9Wdbu0-g', cat:'originals', title:"Dance Like A Robot", dur:'3:27', views:14},
  {id:'BLKQv_NPSfc', cat:'originals', title:"Rower Panger", dur:'6:04', views:13},
  {id:'Q1adLeo7xM0', cat:'originals', title:"1234", dur:'4:37', views:13},
  {id:'IqyiOags_Vw', cat:'originals', title:"Never Changed by WeIrD0RaDi0", dur:'4:14', views:12},
  {id:'80Hb6NKfaZU', cat:'originals', title:"Fractals", dur:'3:41', views:13},
  {id:'_wz03fbpMR0', cat:'originals', title:"The Maze", dur:'4:29', views:35},
  {id:'_G1gzYc3wAk', cat:'originals', title:"X-files", dur:'2:40', views:14},
  {id:'gSxQLwo4cdE', cat:'originals', title:"Thapht Funk by WeIrD0RaDi0", dur:'3:46', views:23},
  {id:'w9t5CIxhd70', cat:'originals', title:"Glitch by WeIrD0RaDi0", dur:'5:11', views:17},
  {id:'fz8iXOmQnJ0', cat:'originals', title:"Trapped Punk by WeIrD0RaDi0", dur:'3:01', views:14},
  {id:'GpySJPDSWtA', cat:'originals', title:"Odd House", dur:'4:28', views:15},
  {id:'brWuSWykYP4', cat:'flips', title:"Beast Boy by WeIrD0RaDi0", dur:'5:37', views:16},
  {id:'DLERFAB6yWU', cat:'originals', title:"The Undertaker.", dur:'3:50', views:57},
  {id:'aXrz5qSc5sU', cat:'flips', title:"Earthworm Jim - New Junk City", dur:'4:01', views:70},
  {id:'ldcRUFEmOGw', cat:'originals', title:"Glass", dur:'2:08', views:13},
  {id:'XfwvppWe-Ho', cat:'flips', title:"Aqua Teen Hunger Force Theme Song (Epic)", dur:'3:17', views:139},
  {id:'ptpNMc-R1iE', cat:'flips', title:"ToeJam and Earl - Alriiight Jammmin", dur:'2:25', views:21},
  {id:'Rx-G4BG6TBE', cat:'originals', title:"Summer Song", dur:'2:33', views:11},
  {id:'5NhMgrmOBnc', cat:'originals', title:"Right In The Kajigger", dur:'2:12', views:26},
  {id:'3CudmsXcqtY', cat:'originals', title:"Meltin Milton", dur:'3:59', views:46},
  {id:'RHztWsvDTgo', cat:'beats', title:"This is America Beat Loop", dur:'3:05', views:79},
  {id:'Yv9gq3WgaGE', cat:'originals', title:"Weirdo", dur:'4:04', views:38},
  {id:'1j6csdRF60A', cat:'flips', title:"Altered Beast", dur:'5:51', views:13},
  {id:'_5yG5PxPZ5I', cat:'originals', title:"Sinister Minister", dur:'3:46', views:99},
];
const CATS = {flips:'Game Flip', beats:'Type Beat', remixes:'Remix', originals:'Original'};
const POPULAR = ['cjxXHD8htYY','6Q9sK6vFums','TEwxGQhHUkA','bdhNSTK4kMA','JUp0UJrpfgY','Kmpom24IGlI','V7q-VsNGIKk','vWKQDKw4qF8','TnjqXyvrzKk','bTlowAnogSE'];
const ALBUM_ART = {flips:'sEPGWmxvXXw', beats:'iWDEqFFZK3s', remixes:'UEO6uyczDMk', originals:'_lqXKH8YWNY'};

const trackById = id => TRACKS.find(t=>t.id===id);
function durSecs(str){ const [m, s] = str.split(':').map(Number); return m * 60 + s; }
function fmt(s){ s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }

/* ---------- Streaming deck engine (API-free) ---------- */
const embedFrame = document.getElementById('embedFrame');
const deckVideo = document.querySelector('.deck-video');
const deckArtImg = document.getElementById('deckArtImg');
const deckGlyph = document.getElementById('deckGlyph');
const bPlay = document.getElementById('bPlay');
const progress = document.getElementById('progress');
const progressFill = document.getElementById('progressFill');
const progressNether = document.getElementById('progressNether');
const progressNetherFill = document.getElementById('progressNetherFill');
const tCur = document.getElementById('tCur');
const tTot = document.getElementById('tTot');
const upNextTitle = document.getElementById('upNextTitle');
const upNextMeta = document.getElementById('upNextMeta');
const bArt = document.getElementById('bArt');
const bTitle = document.getElementById('bTitle');
const sArt = document.getElementById('sArt');
const sTitle = document.getElementById('sTitle');

let currentId = 'UEO6uyczDMk';
let mode = 'single';
let qi = 0;
let shuffle = false;
let isPlaying = false;
let offsetSecs = 0;
let startedAt = 0;
let revealed = false;

function embedSrc(id, autoplay, start){
  let src = `https://www.youtube.com/embed/${id}?rel=0`;
  if(autoplay) src += '&autoplay=1';
  if(start > 0) src += `&start=${Math.floor(start)}`;
  return src;
}
function currentDur(){ const t = trackById(currentId); return t ? durSecs(t.dur) : 0; }
function elapsed(){
  if(!isPlaying) return offsetSecs;
  return Math.min(offsetSecs + (performance.now() - startedAt) / 1000, currentDur());
}
function paintProgress(){
  const d = currentDur() || 1;
  const c = elapsed();
  const pct = (c / d * 100) + '%';
  progressFill.style.width = pct;
  progressNetherFill.style.width = pct;
  progress.setAttribute('aria-valuenow', Math.round(c / d * 100));
  progressNether.setAttribute('aria-valuenow', Math.round(c / d * 100));
  tCur.textContent = fmt(c);
  tTot.textContent = fmt(d);
}
(function tick(){
  if(isPlaying){
    paintProgress();
    if(currentDur() > 0 && elapsed() >= currentDur()){
      advance(1, true);
      toast(`Up next: ${trackById(currentId).title} — hit play if it stays paused.`);
    }
  }
  requestAnimationFrame(tick);
})();
function setPlayingUI(on){
  deckGlyph.textContent = on ? '❚❚' : '▶';
  bPlay.textContent = on ? '❚❚' : '▶';
}
function startClock(from){
  offsetSecs = Math.max(0, from || 0);
  startedAt = performance.now();
  isPlaying = true;
  setPlayingUI(true);
  paintProgress();
}
function stopClock(keep){
  offsetSecs = keep !== undefined ? keep : elapsed();
  isPlaying = false;
  setPlayingUI(false);
  paintProgress();
}
function playCurrent(from){
  embedFrame.src = embedSrc(currentId, true, from || 0);
  startClock(from || 0);
}
function pauseCurrent(){
  const at = elapsed();
  embedFrame.src = embedSrc(currentId, false, at);
  stopClock(at);
}
function togglePlay(){
  if(isPlaying) pauseCurrent();
  else playCurrent(offsetSecs);
}
bPlay.onclick = togglePlay;
document.getElementById('deckArt').onclick = togglePlay;
document.getElementById('deckArt').onkeydown = e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); togglePlay(); } };
document.getElementById('bVideo').onclick = ()=>{
  revealed = !revealed;
  deckArtImg.classList.toggle('art-hidden', revealed);
  deckVideo.classList.toggle('show-video', revealed);
  document.getElementById('bVideo').classList.toggle('on', revealed);
};
// Seek on either bar
let scrubbing = false;
function seekFromBar(barEl, clientX){
  const r = barEl.getBoundingClientRect();
  const frac = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  const target = frac * currentDur();
  if(isPlaying){ embedFrame.src = embedSrc(currentId, true, target); startClock(target); }
  else stopClock(target);
  paintProgress();
}
function wireSeek(barEl){
  barEl.addEventListener('pointerdown', e=>{ scrubbing = true; barEl.setPointerCapture(e.pointerId); seekFromBar(barEl, e.clientX); });
  barEl.addEventListener('pointermove', e=>{ if(scrubbing) seekFromBar(barEl, e.clientX); });
  barEl.addEventListener('pointerup', ()=>{ scrubbing = false; });
}
wireSeek(progress);
wireSeek(progressNether);
function nudgeSecs(delta){
  const target = Math.min(currentDur(), Math.max(0, elapsed() + delta));
  if(isPlaying){ embedFrame.src = embedSrc(currentId, true, target); startClock(target); }
  else stopClock(target);
  paintProgress();
}
[progress, progressNether].forEach(bar=>bar.addEventListener('keydown', e=>{
  if(e.key === 'ArrowRight') nudgeSecs(5);
  if(e.key === 'ArrowLeft') nudgeSecs(-5);
}));

/* ---------- Track loading + transport ---------- */
let filter = 'all';
function loadIntoDeck(t, autoplay){
  currentId = t.id;
  deckArtImg.src = `images/tracks/${t.id}.jpg`;
  deckArtImg.alt = `${t.title} artwork`;
  upNextTitle.textContent = t.title;
  upNextMeta.textContent = `${CATS[t.cat]} • ${t.dur}`;
  bArt.src = `images/tracks/${t.id}.jpg`;
  bTitle.textContent = t.title;
  sArt.src = `images/tracks/${t.id}.jpg`;
  sTitle.textContent = t.title;
  tTot.textContent = t.dur;
  tCur.textContent = '0:00';
  progressFill.style.width = '0%';
  progressNetherFill.style.width = '0%';
  if(autoplay) playCurrent(0);
  else stopClock(0);
  renderAll();
}
function playTrack(id, opts={}){
  const t = trackById(id); if(!t) return;
  if(!opts.keepMode) mode = 'single';
  loadIntoDeck(t, opts.autoplay !== false);
  if(!opts.quiet) document.getElementById('featured').scrollIntoView({behavior:'smooth'});
}
function catalogStep(dir){
  const pool = shuffle ? TRACKS : TRACKS;
  let n;
  if(shuffle && TRACKS.length > 1){
    do { n = TRACKS[Math.floor(Math.random() * TRACKS.length)]; } while(n.id === currentId);
  } else {
    const i = TRACKS.findIndex(t=>t.id===currentId);
    n = TRACKS[(i + dir + TRACKS.length) % TRACKS.length];
  }
  mode = 'single';
  playTrack(n.id);
}
function advance(dir, auto){
  if(mode === 'queue' && queue.length){
    const ni = qi + dir;
    if(ni >= 0 && ni < queue.length){ qi = ni; playTrack(queue[qi], {keepMode:true}); return; }
    if(auto){ toast('Queue finished.'); stopClock(offsetSecs); return; }
  }
  catalogStep(dir);
}
document.getElementById('bPrev').onclick = ()=>{
  if(elapsed() > 3){ playCurrent(0); return; }
  advance(-1, false);
};
document.getElementById('bNext').onclick = ()=>advance(1, false);
document.getElementById('bShuffle').onclick = e=>{
  shuffle = !shuffle;
  document.getElementById('bShuffle').classList.toggle('on', shuffle);
  toast(shuffle ? 'Shuffle on.' : 'Shuffle off.');
};
document.getElementById('artistPlay').onclick = ()=>playTrack('UEO6uyczDMk');
document.addEventListener('click', e=>{
  const q = e.target.closest('[data-queue]');
  if(q){ e.stopPropagation(); addToQueue(q.dataset.queue); return; }
  const p = e.target.closest('[data-play]');
  if(p){ playTrack(p.dataset.play); return; }
  const c = e.target.closest('[data-cat-link]');
  if(c){ setFilter(c.dataset.catLink); }
});

/* ---------- Lists ---------- */
function fmtViews(v){
  if(v >= 1000) return (v/1000).toFixed(1).replace('.0','') + 'K';
  return String(v);
}
function rowHTML(t, i){
  return `<button class="track${t.id===currentId?' playing':''}" data-play="${t.id}">
    <span class="track__art"><img src="images/tracks/${t.id}.jpg" alt="" loading="lazy" /></span>
    <span class="track__number">${i+1}</span>
    <span class="track__title">${t.title}<small>${CATS[t.cat]}${t.badge?` • ${t.badge}`:''} • ${fmtViews(t.views)} plays</small></span>
    <span class="track__length">${t.dur}</span>
    <span class="track__queue" role="button" tabindex="0" data-queue="${t.id}">+ Queue</span>
  </button>`;
}
let popularOpen = false;
function renderPopular(){
  const box = document.getElementById('popularList');
  const ids = popularOpen ? POPULAR : POPULAR.slice(0, 5);
  box.innerHTML = ids.map((id, i)=>{ const t = trackById(id); return t ? rowHTML(t, i) : ''; }).join('');
  document.getElementById('popularMore').textContent = popularOpen ? 'Show Less' : 'Show 5 More';
}
document.getElementById('popularMore').onclick = ()=>{ popularOpen = !popularOpen; renderPopular(); };

const grid = document.getElementById('trackGrid');
const tabs = document.getElementById('tabs');
const search = document.getElementById('search');
function renderTracks(){
  const q = search.value.trim().toLowerCase();
  const list = TRACKS.filter(t => (filter==='all' || t.cat===filter) && (!q || t.title.toLowerCase().includes(q)));
  grid.innerHTML = list.length ? list.map((t, i)=>rowHTML(t, i)).join('') : '<div class="empty">No signal on this frequency. Try another search.</div>';
}
function setFilter(cat){
  filter = cat;
  document.querySelectorAll('#tabs .tab').forEach(t=>t.classList.toggle('active', t.dataset.cat===cat));
  document.querySelectorAll('.plink').forEach(t=>t.classList.toggle('active', t.dataset.cat===cat));
  renderTracks();
  document.getElementById('tracks').scrollIntoView({behavior:'smooth'});
}
tabs.addEventListener('click', e=>{
  const b = e.target.closest('.tab'); if(!b) return;
  setFilter(b.dataset.cat);
});
document.querySelectorAll('.plink').forEach(a=>a.addEventListener('click', e=>{
  e.preventDefault(); setFilter(a.dataset.cat);
}));
document.querySelectorAll('[data-goto-cat]').forEach(a=>a.addEventListener('click', ()=>{
  setFilter(a.dataset.gotoCat);
}));
search.addEventListener('input', renderTracks);

function renderAlbums(){
  const box = document.getElementById('albumGroups');
  box.innerHTML = Object.keys(CATS).map(cat=>{
    const list = TRACKS.filter(t=>t.cat===cat);
    return `<div class="album">
      <div class="album__info">
        <div class="album__info__art"><img src="images/tracks/${ALBUM_ART[cat]}.jpg" alt="${CATS[cat]}" loading="lazy" /></div>
        <div class="album__info__meta">
          <div class="album__year">Weird0Radi0</div>
          <div class="album__name">${CATS[cat]}s</div>
          <div class="album__count">${list.length} tracks • <button class="linklike" data-cat-link="${cat}">Browse all</button></div>
        </div>
      </div>
      <div class="tracks">${list.map((t,i)=>rowHTML(t,i)).join('')}</div>
    </div>`;
  }).join('');
}
function renderRelated(){
  document.getElementById('relatedList').innerHTML = Object.keys(CATS).map(cat=>{
    const n = TRACKS.filter(t=>t.cat===cat).length;
    return `<button class="related-artist" data-cat-link="${cat}">
      <img src="images/tracks/${ALBUM_ART[cat]}.jpg" alt="${CATS[cat]}" loading="lazy" />
      <span>${CATS[cat]}s</span><span class="related-artist__count">${n}</span>
    </button>`;
  }).join('');
}
// Artist tabs
document.getElementById('artistTabs').addEventListener('click', e=>{
  const b = e.target.closest('[data-atab]'); if(!b) return;
  document.querySelectorAll('#artistTabs li').forEach(li=>li.classList.remove('active'));
  b.closest('li').classList.add('active');
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  document.getElementById('pane-' + b.dataset.atab).classList.add('active');
});
function renderAll(){ renderPopular(); renderTracks(); renderAlbums(); renderRelated(); renderSideQueue(); }

/* ---------- Queue ---------- */
const queue = [];
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('overlay');
function openQueue(){ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); overlay.hidden=false; }
function closeQueue(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); overlay.hidden=true; }
document.getElementById('queueOpen').onclick = openQueue;
document.getElementById('queueOpen2').onclick = openQueue;
document.getElementById('queueOpen3').onclick = openQueue;
document.getElementById('sideQueueOpen').onclick = openQueue;
document.getElementById('bQueue').onclick = openQueue;
document.getElementById('queueClose').onclick = closeQueue;
overlay.onclick = closeQueue;
function addToQueue(id){
  const t = trackById(id); if(!t) return;
  if(queue.includes(id)){ toast('Already in your queue.'); openQueue(); return; }
  queue.push(id);
  updateQueue();
  toast(`${t.title} queued.`);
  openQueue();
}
function updateQueue(){
  const box = document.getElementById('queueItems');
  document.getElementById('queueCount').textContent = queue.length;
  box.innerHTML = queue.length ? '' : '<div class="empty">Queue is empty.<br/>Stack some signals.</div>';
  queue.forEach((id, i)=>{
    const t = trackById(id);
    const row = document.createElement('div'); row.className = 'cart-row';
    row.innerHTML = `<img class="cart-thumb" src="images/tracks/${id}.jpg" alt="" /><div><strong>${i+1}. ${t.title}</strong><span>${CATS[t.cat]} • ${t.dur}</span></div>
      <div class="qty"><button data-qplay="${id}">Play</button><button data-qrm="${id}">×</button></div>`;
    box.appendChild(row);
  });
  renderSideQueue();
}
function renderSideQueue(){
  const box = document.getElementById('sideQueue');
  if(!box) return;
  box.innerHTML = queue.length ? '' : '<div class="empty">Queue is empty.</div>';
  queue.slice(0, 6).forEach(id=>{
    const t = trackById(id);
    const b = document.createElement('button');
    b.className = 'friend';
    b.innerHTML = `<img src="images/tracks/${id}.jpg" alt="" /><span>${t.title}</span>`;
    b.onclick = ()=>{ const i = queue.indexOf(id); mode = 'queue'; qi = i; playTrack(id, {keepMode:true, quiet:true}); };
    box.appendChild(b);
  });
}
document.getElementById('queueItems').addEventListener('click', e=>{
  const p = e.target.closest('[data-qplay]'), r = e.target.closest('[data-qrm]');
  if(p){ closeQueue(); const i = queue.indexOf(p.dataset.qplay); if(i >= 0){ mode = 'queue'; qi = i; } playTrack(p.dataset.qplay, {keepMode:true}); }
  if(r){ queue.splice(queue.indexOf(r.dataset.qrm), 1); updateQueue(); }
});
document.getElementById('clearQueue').onclick = ()=>{ queue.length = 0; updateQueue(); };
function playQueue(){
  if(!queue.length){ toast('Queue is empty — add some tracks first.'); return; }
  closeQueue(); mode = 'queue'; qi = 0; playTrack(queue[0], {keepMode:true});
}
document.getElementById('playQueueBtn').onclick = playQueue;
document.getElementById('playQueueBtn2').onclick = playQueue;
document.getElementById('sQueue').onclick = ()=>addToQueue(currentId);

let toastT;
function toast(msg){
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ---------- Collab form ---------- */
const collabForm = document.getElementById('collabForm');
const confirmModal = document.getElementById('confirmModal');
let pending = null;
collabForm.addEventListener('submit', e=>{
  e.preventDefault();
  pending = { name: document.getElementById('collabName').value, email: document.getElementById('collabEmail').value };
  document.getElementById('confirmText').textContent = `Transmit as ${pending.name}? Reply goes to ${pending.email}.`;
  confirmModal.hidden = false;
});
document.getElementById('confirmCancel').onclick = ()=>{ confirmModal.hidden = true; pending = null; };
confirmModal.addEventListener('click', e=>{ if(e.target===confirmModal){ confirmModal.hidden = true; pending = null; } });
document.getElementById('confirmGo').onclick = ()=>{
  confirmModal.hidden = true;
  if(pending){ toast(`Transmission received. Stay weird, ${pending.name}.`); collabForm.reset(); pending = null; }
};

// duplicate ticker removed with hero; init
paintProgress();
renderAll(); updateQueue();
