// Original Pagla motorcycle/CNG handling; inspired by open-world arcade driving.
export function createVehicleDynamics(){
 let speed=0;
 const settings={cng:{max:10.7,reverse:3.2,accel:8.5,brake:15,friction:2.6,steer:1.5},motorcycle:{max:17.5,reverse:2.6,accel:12.3,brake:19,friction:2.1,steer:1.9}};
 const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
 return {
  reset(){speed=0;}, bump(){speed=0;}, getSpeed(){return speed;},
  step(dt,throttle,steering,type){
   const p=settings[type]||settings.cng;
   throttle=clamp(throttle,-1,1);steering=clamp(steering,-1,1);
   const target=throttle>=0?throttle*p.max:throttle*p.reverse;
   const rate=Math.abs(throttle)<.07||speed*target<0?p.brake:p.accel;
   speed+=clamp(target-speed,-rate*dt,rate*dt);
   if(Math.abs(throttle)<.07)speed*=Math.exp(-p.friction*dt);
   if(Math.abs(speed)<.025)speed=0;
   return {speed,headingDelta:steering*p.steer*dt*clamp(Math.abs(speed)/4,0,1)*Math.sign(speed||1)};
  }
 };
}
