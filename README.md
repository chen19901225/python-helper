# python-helper README

python import helper v2, because upgrade failed, so create a new repo
.

## cmd with binding


### import-upgrade (alt+k u)



### select-current-line


这个现在没有了


### function_apply_self (alt+ -)

[//]: cqh_goto: __proj__/src/extension.ts||__function_apply_self__


目的:对于 `func (self, name, value):`

快速插入

```
self.name = name
self.value = value
```

### cqh-python-import-helper.get_parent_args_dict ( `alt`+`]` )

[//]: cqh_goto: __proj__/src/extension.ts||__get_parent_args_dict__


examples:

* `func(self, name, value, **kwargs) ` => insert `name=name, value=value, **kwargs`
* `func(cls, name, value)` => insert `name=name, value=value`


### get_parent_name (alt +[)


[//]: cqh_goto: __proj__/src/extension.ts||__get_parent_name__


get parent function name


### delegate_to_parent (alt+=)

because delegate to parent can complete by `get_parent_name` + `press (` + `get_parent_args_dict` + `press )`

and i dont want add more command ,so ignoire



### dict_unpack (alt+i)

examples:

* a, d = d => a, b = d[a], d[b]

* a,b = c => a, b = c.a, c.b

* a, b = q_ => a, b = q_a, q_b

* a, b = q(" => a, b = q("a"), q("n")

* a, b = q(' => a, b = q('a'), q('n')

* a, b = q( => a, b = q(a), q(b)

* a, b = .c() => a, b = a.c(), b.c()

* a, b = 10* => 10*a, 10*b


### prepend (alt+u)


[//]: cqh_goto: __proj__/src/extension.ts||__dict_prepend__



### get_left_pattern(alt+h)

[//]: cqh_goto: __proj__/src/extension.ts||__get_left_pattern__


### get last if variable (alt + \\)


[//]: cqh_goto: __proj__/src/extension.ts||__get_last_if_variable__


### get last line variable (alt + `)

[//]: cqh_goto: __proj__/src/extension.ts||__get_last_line_variable__


### show var list (alt +n )


show function var by dropdown list


[//]: cqh_goto: __proj__/src/extension.ts||__show_var_list__


### get current file name (alt +k f)

[//]: cqh_goto: __proj__/src/extension.ts||__get_current_filename__


### current class name (alt+k c)

[//]: cqh_goto: __proj__/src/extension.ts||__get_current_classname__


### move op end (alt+ .)



### node format (alt+k n)

[//]: cqh_goto: __proj__/src/extension.ts||__node-format__


### handler var (alt +c )

### select history cusor()

[//]: cqh_goto: __proj__/src/extension.ts||__select-history-cusor__

### __insert-last-import__(alt+k l)

[//]: cqh_goto: __proj__/src/extension.ts||__insert-last-import__



### run pytest in terminal 


[//]: cqh_goto: __proj__/src/extension.ts||__cqh_run_pytest_in_terminal__

### get var from comment (alt +b c)

[//]: cqh_goto: __proj__/src/extension.ts||__get_var_from_comment__


### get var from model (alt+b m)
[//]: cqh_goto: __proj__/src/extension.ts||__get_var_from_model__





## context cmd

### insert base


[//]: cqh_goto: __proj__/src/extension.ts||__insert_base__






