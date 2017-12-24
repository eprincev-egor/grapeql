-- freeze: true
select 
    *,
    Country.code || ' ' || Country.name as code_name

from public.country as Country