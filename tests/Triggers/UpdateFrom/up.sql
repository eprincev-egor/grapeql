create table orders (
  id serial primary key,
  client text not null,
  sale_sum numeric(10, 2) not null default 0,
  buy_sum numeric(10, 2) not null default 0,
  profit numeric(10, 2) not null default 0 check(
      profit = (sale_sum - buy_sum)
  )
);

create table sales (
    id serial primary key,
    id_order integer not null references orders,
    sum numeric(10, 2) not null,
    name text not null
);

create table buys (
    id serial primary key,
    id_order integer not null references orders,
    sum numeric(10, 2) not null,
    name text not null
);


----------------------------

create table companies (
    id serial primary key,
    name text not null unique
);

create table contracts (
    id serial primary key,
    id_company_contractor integer references companies,
    id_company_payer integer references companies,
    status text
);

insert into companies
    (name)
values
    ('MS'),
    ('APP'),
    ('GGL');

insert into contracts
    (id_company_contractor, id_company_payer)
values
    (1, 2),
    (1, 3),
    (2, 1),
    (2, 3),
    (3, 1),
    (3, 2)
;
