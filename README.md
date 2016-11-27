# Lambda

[Try it online!](https://srtobi.github.io/lambda/docs)

Evaluate lambda expressions like (press `shift enter` to evaluate):

~~~~~
pair a b f = f a b
fst p = p (\a b -> a)
snd p = p (\a b -> b)
double a = pair a a
swap p = p (\a b -> pair b a)

n0 = \s z -> z
n1 = \s z -> s z
n2 = \s z -> s (s z)
n3 = \s z -> s (s (s z))

succ n = \s z -> s (n s z)
next p = pair (snd p) (succ (snd p))
pred n = fst(n next (double n0))

sub n m = m pred n
plus n m = n succ m

self a = a a
Y f = self (\x.f (x x))

id a = a

inc i a g = i
add i a g = a
get i a g = g

react n x m = m (n (succ x)) (\y.n (plus x y)) x
new = Y react

bla = new n0
((bla inc) add n2) get
~~~~