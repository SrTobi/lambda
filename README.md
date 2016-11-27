# Lambda

[Try it online!](https://srtobi.github.io/lambda/docs)

Evaluate lambda expressions like (press `shift enter` to evaluate).

## Stddef

~~~~~
id a = a
self a = a a
pipe g f = \x. g (f x) 
Y f = self (\x.f (x x))
~~~~~

## Bool

~~~~~
true t f = t
false t f = f
if cond then else = cond then else
not b = b false true
and lhs rhs = if lhs rhs false
or lhs rhs = if lhs true rhs
~~~~~

## Pair

~~~~~
pair a b f = f a b
fst p = p (\a b -> a)
snd p = p (\a b -> b)
double a = pair a a
swap p = p (\a b -> pair b a)
~~~~

## Church Numbers

Needs pair!

~~~~
n0 = \s z -> z
n1 = \s z -> s z
n2 = \s z -> s (s z)
n3 = \s z -> s (s (s z))

succ n = \s z -> s (n s z)
_pred_next p = pair (snd p) (succ (snd p))
pred n = fst(n _pred_next (double n0))

sub n m = m pred n
plus n m = n succ m
mul n m = \s z -> n (m s) z
exp n m = \s z -> m n s z

isZero n = n (\z -> false) true
equals n m = and (isZero (sub n m)) (isZero (sub m n))
~~~~

## Church Lists

Needs bool and stddef

~~~~
list0 = end
list1 e1 = prep e1 end
list2 e1 e2 = prep e1 (list1 e2)
list3 e1 e2 e3 = prep e1 (list2 e2 e3)
list4 e1 e2 e3 e4 = prep e1 (list3 e2 e3 e4)

end = \f n -> n
prep elem list = \f n -> f elem (list f n)
append elem list = \f n -> list f (f elem n)

length = foldr (\e.succ) n0
isEmpty list = list (\e acc -> false) true

map m list = \f n -> list (pipe f m) n
foldr f n list = list f n
foldl f n list = list (\elem func -> (\acc -> func (f elem acc))) (\acc -> acc) n

head list = foldr (\elem acc -> elem) error list
last list = foldl (\elem acc -> elem) error list
tail list = snd (foldr (\elem acc -> pair (prep elem (fst acc)) (fst acc)) (pair end error) list)

reverse = foldr append end

all pred = foldr (pipe and pred) true
none pred = foldr (pipe and (pipe not pred)) true
one pred = foldr (pipe or pred) false
~~~~

## Other interesting stuff

~~~~
iterate f n times = snd(times (\p -> (\v.pair (f v) (append v (snd p))) (fst p)) (pair n end))

max n m = if (isZero (sub n m)) m n
min n m = if (isZero (sub n m)) n m

maximum = foldr max n0
minimum list = foldr min (head list) list


lesseq n m = isZero (sub n m)


fak_impl fak n = if (isZero n) n1 (mul n (fak (pred n)))
fak = Y fak_impl
~~~~

## Unit tests

~~~~
beginUnitTest utest test = utest true test
unitTest prev test = \nextUnit nextTest -> nextUnit (and prev test) nextTest
unitTestF prev test = \nextUnit nextTest -> nextUnit (not (and prev test)) nextTest
endUnitTest last test= last
~~~~