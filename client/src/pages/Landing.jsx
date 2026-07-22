import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Code, Search, Bell, Settings, Zap, Terminal, MoreVertical, 
  ArrowRight, ExternalLink, Eye, Lock, Flame, AtSign, Rss 
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen text-on-surface bg-background font-inter overflow-x-hidden">
      {/* TopNavBar */}
      <header className="w-full top-0 sticky z-50 border-b border-outline-variant bg-surface/80 backdrop-blur-md shadow-sm">
        <nav className="flex justify-between items-center px-lg h-16 w-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-xl">
            <Link to="/" className="font-inter font-bold text-2xl text-primary tracking-tighter">PasteBin Pro</Link>
          </div>
          <div className="flex items-center gap-md">
            <div className="hidden md:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search snippets..." 
                className="bg-surface-container border border-outline-variant rounded-lg pl-10 pr-4 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="text-on-surface-variant hover:bg-surface-variant/50 p-2 rounded-lg transition-all active:scale-95">
                <Bell size={20} />
              </button>
              <button className="text-on-surface-variant hover:bg-surface-variant/50 p-2 rounded-lg transition-all active:scale-95">
                <Settings size={20} />
              </button>
              <Link to="/create" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold hover:bg-primary-container transition-all active:scale-95 ml-2">
                New Paste
              </Link>
              <Link to="/login" className="bg-surface-variant text-on-surface px-4 py-2 rounded-lg font-bold hover:brightness-110 transition-all active:scale-95 ml-2">
                Login
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="relative flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
          
          <div className="max-w-[1440px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 relative z-10">
            <div className="flex-1 text-center lg:text-left">
              <motion.h1 
                className="font-inter font-bold text-5xl md:text-6xl text-on-surface mb-6 leading-tight"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Secure Snippets, <br/>
                <span className="text-primary">Redis-Fast Performance.</span>
              </motion.h1>
              
              <motion.p 
                className="text-on-surface-variant text-lg max-w-2xl mb-8 mx-auto lg:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Streamline your workflow with the fastest pasting service for developers. Built on Redis for sub-millisecond persistence, secured with AES-256 encryption, and designed for maximum density.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link to="/register" className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-container transition-all shadow-lg glow-primary active:scale-95 flex items-center gap-2">
                  <Zap size={20} />
                  Get Started Free
                </Link>
                <button className="bg-surface-variant/30 border border-outline-variant text-on-surface px-8 py-4 rounded-xl font-bold text-lg hover:bg-surface-variant/50 transition-all active:scale-95 flex items-center gap-2">
                  <Terminal size={20} />
                  API Documentation
                </button>
              </motion.div>
            </div>
            
            {/* Create Anonymous Paste Editor Area */}
            <motion.div 
              className="flex-1 w-full max-w-2xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="glass-panel rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-surface-container-high px-4 py-2 flex justify-between items-center border-b border-outline-variant">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-error"></div>
                    <div className="w-3 h-3 rounded-full bg-tertiary"></div>
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-geist text-[11px] font-semibold tracking-wider text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded uppercase">anonymous.js</span>
                    <MoreVertical size={16} className="text-on-surface-variant" />
                  </div>
                </div>
                <div className="p-4 bg-surface-container-lowest h-64 font-geist text-sm overflow-hidden relative">
                  <div className="flex gap-4 h-full">
                    <div className="text-outline-variant select-none border-r border-outline-variant pr-4 flex flex-col">
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
                    </div>
                    <div className="flex-1">
                      <span className="code-syntax-keyword">const</span> <span className="text-primary">paste</span> = <span className="code-syntax-keyword">async</span> () =&gt; {'{'}<br/>
                      &nbsp;&nbsp;<span className="code-syntax-keyword">const</span> data = <span className="code-syntax-keyword">await</span> redis.<span className="text-primary">set</span>(<span className="code-syntax-string">'id'</span>);<br/>
                      &nbsp;&nbsp;<span className="code-syntax-comment">// Secure TTL enabled</span><br/>
                      &nbsp;&nbsp;<span className="code-syntax-keyword">return</span> <span className="code-syntax-string">"Fast &amp; Secure"</span>;<br/>
                      {'}'};
                      <div className="absolute inset-x-4 bottom-4 flex items-center gap-2">
                        <input className="bg-transparent border-none outline-none text-on-surface w-full focus:ring-0" placeholder="Paste your code here..." type="text"/>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container p-4 border-t border-outline-variant flex flex-wrap justify-between items-center gap-4">
                  <div className="flex gap-2">
                    <select className="bg-surface-container-low border border-outline-variant text-on-surface-variant text-[11px] font-semibold tracking-wider px-2 py-1 rounded uppercase outline-none">
                      <option>JavaScript</option>
                      <option>Python</option>
                      <option>Go</option>
                    </select>
                    <select className="bg-surface-container-low border border-outline-variant text-on-surface-variant text-[11px] font-semibold tracking-wider px-2 py-1 rounded uppercase outline-none">
                      <option>Expires: 24h</option>
                      <option>Burn on read</option>
                      <option>Forever</option>
                    </select>
                  </div>
                  <Link to="/create" className="bg-secondary text-on-secondary px-6 py-2 rounded-lg font-bold text-[11px] tracking-wider uppercase hover:bg-secondary-container transition-all active:scale-95 inline-block">CREATE PASTE</Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trending Pastes (Bento Grid) */}
        <section className="py-12 max-w-[1440px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="font-inter font-semibold text-2xl text-on-surface">Trending Snippets</h2>
              <p className="text-on-surface-variant text-sm mt-1">The most viewed public snippets in the last hour.</p>
            </div>
            <Link to="/pastes" className="text-primary text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 hover:underline">
              EXPLORE ALL <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Snippet Card 1 */}
            <div className="glass-panel p-4 rounded-xl hover:border-primary transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase">JAVASCRIPT</span>
                  <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-[11px] font-bold tracking-wider flex items-center gap-1">
                    <Eye size={12} /> 12.4k
                  </span>
                </div>
                <ExternalLink size={18} className="text-on-surface-variant group-hover:text-primary" />
              </div>
              <h3 className="font-inter font-semibold text-lg text-on-surface mb-2">OAuth2 Implementation Pattern</h3>
              <p className="text-on-surface-variant text-sm line-clamp-3 font-geist bg-surface-container-lowest p-2 rounded border border-outline-variant/30 mb-4 whitespace-pre-wrap">
{`export const authorize = (req, res) => {
  const client = getClient(req.body.id);
  // ... validate scopes
};`}
              </p>
              <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                <div className="w-5 h-5 rounded-full overflow-hidden border border-outline-variant/50">
                  <div className="w-full h-full bg-surface-variant flex items-center justify-center text-[10px] text-white">DM</div>
                </div>
                <span>dev_master_99</span>
                <span className="ml-auto text-[11px] font-semibold tracking-wider">2 hours ago</span>
              </div>
            </div>

            {/* Snippet Card 2 */}
            <div className="glass-panel p-4 rounded-xl hover:border-primary transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="bg-tertiary-container/20 text-tertiary px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase">PYTHON</span>
                  <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-[11px] font-bold tracking-wider flex items-center gap-1">
                    <Eye size={12} /> 8.9k
                  </span>
                </div>
                <ExternalLink size={18} className="text-on-surface-variant group-hover:text-primary" />
              </div>
              <h3 className="font-inter font-semibold text-lg text-on-surface mb-2">FastAPI Middleware Boilerplate</h3>
              <p className="text-on-surface-variant text-sm line-clamp-3 font-geist bg-surface-container-lowest p-2 rounded border border-outline-variant/30 mb-4 whitespace-pre-wrap">
{`@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()`}
              </p>
              <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                <div className="w-5 h-5 rounded-full overflow-hidden border border-outline-variant/50">
                  <div className="w-full h-full bg-surface-variant flex items-center justify-center text-[10px] text-white">CA</div>
                </div>
                <span>cloud_architect</span>
                <span className="ml-auto text-[11px] font-semibold tracking-wider">4 hours ago</span>
              </div>
            </div>

            {/* Snippet Card 3 */}
            <div className="glass-panel p-4 rounded-xl hover:border-primary transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="bg-secondary-container/20 text-secondary px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase">GO</span>
                  <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-[11px] font-bold tracking-wider flex items-center gap-1">
                    <Eye size={12} /> 5.1k
                  </span>
                </div>
                <ExternalLink size={18} className="text-on-surface-variant group-hover:text-primary" />
              </div>
              <h3 className="font-inter font-semibold text-lg text-on-surface mb-2">Concurrency Worker Pool</h3>
              <p className="text-on-surface-variant text-sm line-clamp-3 font-geist bg-surface-container-lowest p-2 rounded border border-outline-variant/30 mb-4 whitespace-pre-wrap">
{`func worker(id int, jobs <-chan int, results chan<- int) {
  for j := range jobs {
    results <- j * 2
  }
}`}
              </p>
              <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                <div className="w-5 h-5 rounded-full overflow-hidden border border-outline-variant/50">
                  <div className="w-full h-full bg-surface-variant flex items-center justify-center text-[10px] text-white">SC</div>
                </div>
                <span>system_core</span>
                <span className="ml-auto text-[11px] font-semibold tracking-wider">15 mins ago</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-surface-container-low/50 relative mt-12">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-inter font-semibold text-2xl text-on-surface">Pro Features for Power Users</h2>
              <p className="text-on-surface-variant mt-2">Built for reliability, security, and extreme speed.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 text-primary">
                  <Zap size={32} />
                </div>
                <h3 className="font-inter font-semibold text-lg text-on-surface mb-2">Redis-Backed Persistence</h3>
                <p className="text-on-surface-variant text-sm">Experience sub-millisecond response times with our globally distributed Redis clusters. Your data is always ready when you are.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20 text-secondary">
                  <Lock size={32} />
                </div>
                <h3 className="font-inter font-semibold text-lg text-on-surface mb-2">AES-256 Encryption</h3>
                <p className="text-on-surface-variant text-sm">Client-side encryption ensures that your sensitive snippets never leave your browser without being protected by industry-standard protocols.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-tertiary-container/10 flex items-center justify-center mb-6 border border-tertiary-container/20 text-tertiary">
                  <Flame size={32} />
                </div>
                <h3 className="font-inter font-semibold text-lg text-on-surface mb-2">Burn After Reading</h3>
                <p className="text-on-surface-variant text-sm">Self-destructing pastes offer the ultimate privacy. Set a view count or a TTL, and the snippet is purged from our memory-tier permanently.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics CTA */}
        <section className="max-w-[1440px] mx-auto px-6 py-24">
          <div className="glass-panel p-12 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 border border-outline-variant/30">
            <div className="relative z-10 flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-[11px] font-bold tracking-wider">LIVE METRICS</span>
                <span className="flex items-center gap-2 text-on-surface-variant text-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span> 4,512 Active Connections
                </span>
              </div>
              <h2 className="font-inter font-bold text-4xl md:text-5xl text-on-surface mb-4 leading-tight">Ready to scale your snippets?</h2>
              <p className="text-on-surface-variant text-lg">Join 50,000+ developers using PasteBin Pro for internal documentation and rapid debugging.</p>
            </div>
            <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto min-w-[200px]">
              <Link to="/register" className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-container transition-all active:scale-95 text-center">Start for Free</Link>
              <button className="text-on-surface border border-outline-variant px-8 py-4 rounded-xl font-bold text-lg hover:bg-surface-variant/30 transition-all text-center">Contact Enterprise</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-outline-variant bg-surface-container-lowest mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-[1440px] mx-auto gap-6">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <span className="font-inter font-semibold text-lg text-on-surface">PasteBin Pro</span>
            <p className="text-sm text-on-surface-variant">© {new Date().getFullYear()} PasteBin Pro Inc. Built for developers.</p>
          </div>
          <div className="flex gap-8 flex-wrap justify-center">
            <a className="text-sm text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4" href="#">API Docs</a>
            <a className="text-sm text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4" href="#">Privacy</a>
            <a className="text-sm text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4" href="#">Terms</a>
            <a className="text-sm text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4" href="#">Security</a>
            <a className="text-sm text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4" href="#">Status</a>
          </div>
          <div className="flex gap-4">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><AtSign size={20} /></a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><Rss size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

