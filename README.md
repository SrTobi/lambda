# Lambda

<p>
    This tool lets you evaluate lambda expressions.
    Just enter your code into the code box and click <b>Run</b> or press <i><code>Strg+Enter</code>.</i>
    You may also create a new code box: just press <i><code>Shift+Enter</code></i>.
</p>

[Try it online!](https://srtobi.github.io/lambda/docs)

<h4>Lambda</h4>
<p>
    Lambda expressions can be written in the usual way.
</p>

<pre>(\arg.arg var) (\i.i)</pre>

<p>
    In the box below the code you can now see how your expression is evaluated.
    The underlines will indicate the redix that is currentliy evaluated.
</p>

<pre>(\arg.arg var) (\i.i)
=> (\i.i) var
=> var</pre>

<p>
    You may also define aliases for lambda expressions. Just assign them to a name using <code>[alias] = [lambda]</code>.
    The alias will then act as if it were the assigned expression.
    Remember that you <b>can not</b> use the alias in the expression itself!
</p>
<pre>
id = (\i.i)
(\arg.arg var) id
</pre>

<p>
    If you have <code>Transform Aliases</code> activated an alias will be transformed to its definition befor it gets evaluated.
</p>
<pre>
(\arg.arg var) id
=> id var
&nbsp;= (\i.i) var
=> var
</pre>


<h4>Syntactic sugar</h4>
<p style={{color:"red"}}><b>Do not</b> use the following syntax in your exam!</p>
<p>To make things easier there are two shortcuts regarding arguments:</p>

<pre>
// the following lines are equivalent
func a b = expr
func = \a.\b.expr

// the following lines are equivalent
\a b -> expr
\a.\b.expr
</pre>