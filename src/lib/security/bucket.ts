export class RateBucket {
 private buckets=new Map<string,{count:number;until:number}>();
 private capacity:number;
 constructor(capacity=5000){this.capacity=capacity;}
 consume(key:string,max:number,windowMs:number,cost=1,now=Date.now()){
  if(!Number.isInteger(cost)||cost<1||cost>max)return false;
  const old=this.buckets.get(key);if(old&&old.until>now){if(old.count+cost>max)return false;old.count+=cost;return true;}
  if(this.buckets.size>=this.capacity){for(const [k,b]of this.buckets)if(b.until<=now)this.buckets.delete(k);if(this.buckets.size>=this.capacity&&!old)return false;}
  this.buckets.set(key,{count:cost,until:now+windowMs});return true;
 }
}
