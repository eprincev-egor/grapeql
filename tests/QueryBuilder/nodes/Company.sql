select
    company.id,
    * ,
    public.company.inn as inn,
    coalesce( company.name, '(Не определено)' ) as name
from company

left join country on
    country.id = company.id_country
