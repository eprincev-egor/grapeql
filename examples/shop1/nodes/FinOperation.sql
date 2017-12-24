select * from public.fin_operation as FinOperation

import 'Order' as FinOrder
using order_id

import 'Nomenclature'
using nomenclature_id

import 'Currency'
using currency_id

import 'Company' as Executor
using executor_id