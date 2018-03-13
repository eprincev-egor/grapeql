select *
from public.Order

left join ./Company as CompanyClient on
    CompanyClient.id = public.Order.id_company_client