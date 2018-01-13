select 
    id,
    * ,
    coalesce( company.name, '(Не определено)' ) as name
from company
