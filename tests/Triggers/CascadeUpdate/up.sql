create table countries (
    id serial primary key,
    code text not null
);

create table companies (
    id serial primary key,
    name text not null unique,
    id_country integer not null references countries on delete cascade
);

create table orders (
    id serial primary key,
    id_company integer references companies on delete set null
);
