# Syntax:
		+ isnull
		+ notnull
		+ is not distinct from
        + is distinct from
		+ ilike
		+ similar
		+ expression IS TRUE
		+ expression IS NOT TRUE
		+ expression IS FALSE
		+ expression IS NOT FALSE
		+ expression IS UNKNOWN
		+ expression IS NOT UNKNOWN
		+ window functions
        + agg_func() filter (where ...)
        - with values

# QueryBuilder:
    + where
    + orderBy
    + from File
    - file in any select (scan subqueries and withs)
    + remove unnesary joins:
        + unnesary left join
            left join
            inner join
    + add with from file
    + remove unnesary withs
    - add window func from file
    - defined columns in files
    - test join self
    - update
    - delete
    - insert
    + getCount
    + indexOf
    - getUniqDays
# QueryBuilder:
    - $vars
    - check double quotes in any from file
    - fix memory leaks
    - optimize
    - validations

# Tasks:
    - crud events
    - deps
    - transaction

# Cache Island:
    (
        select count()
        from ...
    )
    on update ... set where
        ...reverse query...

# extention
    extention name for table (
        some_column text not null
    )

# custom pg things:
    - custom types (by db)
    - custom operators (by db)

# DocBuilder
