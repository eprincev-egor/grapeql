create table tree (
    id serial primary key,
    id_parent integer references tree on delete cascade,
    name text not null unique
);

