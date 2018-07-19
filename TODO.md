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
        + delete
          + RETURNING
        + insert
          + RETURNING
          - conflict_target [ COLLATE collation ] [ opclass ]
        + update
          + RETURNING

        + with values
           + check removeWiths, removeJoins, getColumnSource, QueryBuilder
        + with update
           + check removeWiths, removeJoins, getColumnSource, QueryBuilder
        + with insert
          + check removeWiths, removeJoins, getColumnSource, QueryBuilder
        + with delete
          + check removeWiths, removeJoins, getColumnSource, QueryBuilder

        - format sql
        - collate
        - test walk (deep walk)

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
    + $vars
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
    - show correct call stack on error

# Cache Island:
    (
        select count()
        from ...
    )
    on update ... set where
        ...reverse query...

# client lib
    - ws
    - scheme
    - any crud

# extension
    extension name for table (
        some_column text not null
    )

# custom pg things:
    - custom types (by db)
    - custom operators (by db)

# DocBuilder
