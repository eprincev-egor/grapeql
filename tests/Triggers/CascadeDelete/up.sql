create table tree (
    id serial primary key,
    id_parent integer references tree on delete cascade,
    name text not null unique
);

insert into tree 
    (name) 
values 
    ('root');

insert into tree 
    (id_parent, name) 
values
    (1, 'root/child 1'),
    (1, 'root/child 2');