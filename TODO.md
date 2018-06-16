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
        - format sql

# QueryBuilder:
    + where
    + orderBy
       - order by 90 in file
    + from File
    + file in any select (scan subqueries and withs)
    + remove unnesary joins:
        + unnesary left join
            left join
            inner join
    + add with from file
    + remove unnesary withs
        + with x as (..) select (with x as (..))
    + defined columns in files
    + test join self
        + error on "inner join self file"
        + error on "from self file"
    - add window func from file
    - update
    + delete
    + insert
    - $vars
    + getCount
    + indexOf
    - distinct
    - getUniqDays
    - check double quotes in any from file
    - long names (64 max)
    - fix memory leaks
    - out of memory
    - optimize
    - validations

# Tasks:
	- raw
    - crud events
    - deps
    - transaction
	- jsql

# Cache Island:
    (
        select count()
        from ...
    )
    on update ... set where
        ...reverse query...

# clinet lib
    - ws
    - scheme
    - any crud

# extention
    extention name for table (
        some_column text not null
    )

# custom pg things:
    - custom types (by db)
    - custom operators (by db)

# DocBuilder
