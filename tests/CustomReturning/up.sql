create table company (
    id serial primary key,
    name text not null unique,
    inn text not null unique
);

insert into company
    (name, inn)
values
    ('Red', '123'),
    ('Green', '456');