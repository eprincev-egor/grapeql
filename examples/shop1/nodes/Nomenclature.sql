select * 
from public.nomenclature as Nomenclature

left join ./Nomenclature as ParentNomenclature
using parent_id
