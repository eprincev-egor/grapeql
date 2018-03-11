select 
    company.id,
    * ,
    coalesce( company.name, '(Не определено)' ) as name
from company

left join country on
    country.id = company.id_country