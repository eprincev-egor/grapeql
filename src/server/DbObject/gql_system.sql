drop schema if exists gql_system;
create schema gql_system;

create table gql_system.log_changes (
    id serial primary key,
    -- transaction id
    tid text not null,
    -- operation type:
    --   1 insert
    --   2 update
    --   3 delete
    tg_op smallint not null check (tg_op in (1,2,3)),
    -- changed table
    table_name text not null,
    -- on insert and delete
    -- data is just row (deleted or inserted)
    -- {...}
    -- in update case, data is
    -- { new: {...}, old: {...} }
    data jsonb
);


create or replace function gql_system.log_changes()
returns trigger as $body$
declare data jsonb;
declare table_name text;
begin
    -- universal trigger function for log changes
    
    table_name = TG_TABLE_SCHEMA::text || '.' || TG_TABLE_NAME::text;
    
    if TG_OP = 'INSERT' then
        insert into gql_system.log_changes 
            (tid, tg_op, table_name, data)
        values
            (new.xmin::text, 1, table_name, row_to_json(new));
        
        return new;
    end if;

    if TG_OP = 'UPDATE' then
        insert into gql_system.log_changes 
            (tid, tg_op, table_name, data)
        values
            (new.xmin::text, 2, table_name, json_build_object(
                'old', row_to_json(old),
                'new', row_to_json(new)
            ));
        
        return new;
    end if;

    if TG_OP = 'DELETE' then
        insert into gql_system.log_changes 
            (tid, tg_op, table_name, data)
        values
            (old.xmax::text, 3, table_name, row_to_json(old));
        
        return old;
    end if;

end
$body$
language plpgsql;

-- need for checking variables in gql files
create or replace function gql_system.raise_exception(text)
returns void as $$
begin
    raise exception '%', $1;
end;
$$ language plpgsql;