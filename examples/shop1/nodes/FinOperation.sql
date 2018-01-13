select * from public.fin_operation as FinOperation

left join ./Order as FinOrder
using order_id

left join ./Nomenclature
using nomenclature_id

left join ./Currency
using currency_id

left join ./Company as Executor
using executor_id