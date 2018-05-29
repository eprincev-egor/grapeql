Syntax:
		isnull
		notnull
		is distinct from
		is not distinct from
		ilike
		similar
		expression IS TRUE
		expression IS NOT TRUE
		expression IS FALSE
		expression IS NOT FALSE
		expression IS UNKNOWN
		expression IS NOT UNKNOWN
		window functions
        agg_func() filter (where ...)

QueryBuilder:
    where
    orderBy
    from File
    file in any select (scan subqueries and withs)
    update
    delete
    insert
    getCount
    indexOf
    getUniqDays
    $vars
    optimize
    validations

Cache Island:
    (
        select count()
        from ...
    )
    on update ... set where
        ...reverse query...

Tasks:
    crud events
    deps
    transaction

custom types (by db)
custom operators (by db)

DocBuilder
