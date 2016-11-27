import {Lambda, LambdaFactory} from './lambda';
import {Block} from './block';
import {to_string} from './textPrinter';
import {reduceAll, normalReduce} from './evaluate';

let fac = new LambdaFactory();
let c = new Block(fac);

c.setCode("pair a b f = f a b; fst p = p (\\a b -> a); snd p = p (\\a b -> b); double a = pair a a; swap p = p (\\a b -> pair b a);func = snd (swap (pair c d))")
let func = c.lookup("func");


c.definitions().forEach((func) => console.log(to_string(func, {expand_alias: false, print_id: false, print_def: true})))

if(func)
{
    let list = reduceAll(func.def(), normalReduce, fac);
    console.log("list-size: " + list.length);
    list.forEach((step) => console.log(to_string(step, {expand_alias: false, print_id: false, print_def: false})));
}