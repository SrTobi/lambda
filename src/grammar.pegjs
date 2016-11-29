Block = ([\n\r \t])*  entities:Entity* {
    return {
        type: "block",
        entities: entities.filter((e) => { return e;})
    };
}

Entity = entity:(Def / Expr / Comment) _ [\n\r;]* {
    return entity;
}

Comment = _ ("--" / "//") ([^\n\r]*) {
    return undefined;
}

Def = name:Identifier params:(Identifier*) '=' _ def:Expr
{
    return {
        type: "def",
        name: name,
        params: params,
        def: def
    };
}

Atom = Var /*/ Number*/ / ExprP

Expr = Abstraction / Application /*/ Operation*/ / Atom

ExprP = _ '(' _ exp:Expr _ ')' _
{
    return exp;
}

Abstraction = Abstraction1 / Abstraction2

Abstraction1 = _ '\\' varId:Identifier "." expr:Expr
{
    return {
        type: "abstr",
        vars: [varId],
        expr: expr
    };
}

Abstraction2 = _ '\\' vars:(Identifier+) "->" expr:Expr
{
    return {
        type: "abstr",
        vars: vars,
        expr: expr
    };
}
  
Application = func:Func args:(Atom+)
{
    return {
        type: "appl",
        func: func,
        args: args
    };
}

Func = Abstraction / Atom

Operant = op:Operator operant:Atom
{
    return {
        op: op,
        operant: operant
    };
}

Operation = first:Atom _ operants:(Operant)+
{
    return {
        type: "operation",
        first: first,
        operants: operants
    };
}

Var = id:Identifier
{
    return { type: "var", id: id};
}

Number = _ num:Integer _
{
    return {type: "number", number: num};
}

Identifier "variable" = _ id:$([_a-zA-Z][_a-zA-Z0-9]*) _
{
  return id;
}

Integer "integer" = [0-9]+ { return parseInt(text(), 10); }

Operator = $([-+%/<>=\[\]^!=&{}*?#$|~]+ / '`' Identifier '`')

_ "whitespace" = ([ \t]/[\n\r]+[ \t])*