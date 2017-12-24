select * from public.order

import 'Company' as Client
using public.order.client_id

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
        ) as sale,
        
        string_agg(
            nomenclature.name
        ) filter(
            where fin_operation.type = 'buy'
        ) as buy_nomenclatures,
        
        string_agg(
            nomenclature.name
        ) filter(
            where fin_operation.type = 'sale'
        ) as sale_nomenclatures
    from fin_operation
    
    left join nomenclature on
        nomenclature.id = fin_operation.nomenclature_id
    
    where
        fin_operation.order_id = public.order.id
) as FinTotal on true