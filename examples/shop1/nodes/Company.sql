select
    *,
    
    (
        select string_agg( company_role.name )
        from company_role
        where
            company_role.id = any( Company.roles )
    ) as roles_names,

    (case
        when Company.name like '%ecu%'
        then 'ECU' || LastOrder.doc_number
        else LastOrder.doc_number
    end) as last_order_name

from public.company as Company

import 'Order' as LastOrder
using Company.last_order_id

import 'Country'
using Company.country_id

import 'User' as Manager
using Company.manager_id

left join lateral (
    select
        sum( 
            fin_operation.cost *
            get_currency_relation( 
                fin_operation.currency_id, 
                fin_operation.date, 
                get_default_currency() 
            ) 
        ) filter (
            where fin_operation.type = 'buy'
        ) as buy,
        
        sum( 
            fin_operation.cost *
            get_currency_relation( 
                fin_operation.currency_id, 
                fin_operation.date, 
                get_default_currency() 
            ) 
        ) filter (
            where fin_operation.type = 'sale'
        ) as sale
        
    from fin_operation
    
    left join public.order on
        fin_operation.order_id = public.order.id
    
    where
        public.order.client_id = Company.id
) as FinTotal on true
