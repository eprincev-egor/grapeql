create table orders (
    id serial primary key,
    start_date timestamp without time zone,
    end_date timestamp without time zone
);

create table traffic (
    id serial primary key,
    id_order integer not null references orders on delete cascade,
    id_prev_traffic integer references traffic,
    duration_hours double precision not null,
    to_point text not null,
    expected_begin_date timestamp without time zone,
    expected_delivery_date timestamp without time zone,
    actual_delivery_date timestamp without time zone
);

insert into orders default values;

insert into traffic 
    (id_order, duration_hours, to_point)
values
    (1, 24, 'Moscow');

insert into traffic 
    (id_order, id_prev_traffic, duration_hours, to_point)
values
    (1, 1, 48, 'Berlin');

insert into traffic 
    (id_order, id_prev_traffic, duration_hours, to_point)
values
    (1, 2, 72, 'Hong Kong');