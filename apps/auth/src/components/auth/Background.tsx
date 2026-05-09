const Background = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-float" />
    <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-primary/8 blur-[100px] animate-float-delayed" />
    <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-primary/3 blur-[80px] animate-float-slow" />
  </div>
);

export default Background;
