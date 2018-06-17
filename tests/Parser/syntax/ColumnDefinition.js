"use strict";

module.exports = [
    {
        str: "name text",
        result: {
            name: {word: "name"},
            type: {
                type: "text"
            }
        }
    },
    {
        str: "name text not null",
        result: {
            name: {word: "name"},
            type: {
                type: "text"
            },
            notNull: true
        }
    },
    {
        str: "name text unique",
        result: {
            name: {word: "name"},
            type: {
                type: "text"
            },
            unique: {}
        }
    },
    {
        str: "name text primary key",
        result: {
            name: {word: "name"},
            type: {
                type: "text"
            },
            primaryKey: {}
        }
    },
    {
        str: "name boolean not null default true",
        result: {
            name: {word: "name"},
            type: {
                type: "boolean"
            },
            notNull: true,
            default: {elements: [
                {boolean: true}
            ]}
        }
    },
    {
        str: "name boolean default false",
        result: {
            name: {word: "name"},
            type: {
                type: "boolean"
            },
            default: {elements: [
                {boolean: false}
            ]}
        }
    },
    {
        str: "price numeric(10, 2) not null default 0 check( price>= 0)",
        result: {
            name: {word: "price"},
            type: {
                type: "numeric(10,2)"
            },
            notNull: true,
            default: {elements: [
                {number: "0"}
            ]},
            check: {elements: [
                {link: [
                    {word: "price"}
                ]},
                {operator: ">="},
                {number: "0"}
            ]}
        }
    },
    {
        str: "price numeric(10, 2) default 0 not null check( price>= 0)",
        result: {
            name: {word: "price"},
            type: {
                type: "numeric(10,2)"
            },
            notNull: true,
            default: {elements: [
                {number: "0"}
            ]},
            check: {elements: [
                {link: [
                    {word: "price"}
                ]},
                {operator: ">="},
                {number: "0"}
            ]}
        }
    },
    {
        str: "price numeric(10, 2) default 0 check( price>= 0) not null",
        result: {
            name: {word: "price"},
            type: {
                type: "numeric(10,2)"
            },
            notNull: true,
            default: {elements: [
                {number: "0"}
            ]},
            check: {elements: [
                {link: [
                    {word: "price"}
                ]},
                {operator: ">="},
                {number: "0"}
            ]}
        }
    },
    {
        str: "name text unique not deferrable initially immediate",
        result: {
            name: {word: "name"},
            type: {
                type: "text"
            },
            unique: {
                deferrable: false,
                initially: "immediate"
            }
        }
    },
    {
        str: "name text unique not null",
        result: {
            name: {word: "name"},
            type: {
                type: "text"
            },
            unique: {},
            notNull: true
        }
    },
    {
        str: "name text primary key initially deferred unique deferrable",
        result: {
            name: {word: "name"},
            type: {
                type: "text"
            },
            unique: {
                deferrable: true
            },
            primaryKey: {
                initially: "deferred"
            }
        }
    },
    {
        str: "name text primary key initially deferred unique deferrable check(name ilike '%ooo%') default 'ooo'",
        result: {
            name: {word: "name"},
            type: {
                type: "text"
            },
            unique: {
                deferrable: true
            },
            primaryKey: {
                initially: "deferred"
            },
            check: {elements: [
                {link: [
                    {word: "name"}
                ]},
                {operator: "ilike"},
                {content: "%ooo%"}
            ]},
            default: {elements: [
                {content: "ooo"}
            ]}
        }
    },
    {
        str: "id_company integer not null references company",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]}
            }
        }
    },
    {
        str: "id_company integer not null references company(id)",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                column: {word: "id"}
            }
        }
    },
    {
        str: "id_company integer references company match Full",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                match: "full"
            }
        }
    },
    {
        str: "id_company integer references company match Simple",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                match: "simple"
            }
        }
    },
    {
        str: "id_company integer references company match PARTIAL",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                match: "partial"
            }
        }
    },
    {
        str: "id_company integer not null references company not deferrable",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                deferrable: false
            }
        }
    },
    {
        str: "id_company integer not null references company deferrable",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                deferrable: true
            }
        }
    },
    {
        str: "id_company integer not null references company initially immediate",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                initially: "immediate"
            }
        }
    },
    {
        str: "id_company integer not null references company initially deferred",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                initially: "deferred"
            }
        }
    },
    {
        str: "id_company integer not null references company deferrable initially deferred",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                deferrable: true,
                initially: "deferred"
            }
        }
    },
    {
        str: "id_company integer not null references company ( id ) deferrable initially deferred",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                column: {word: "id"},
                deferrable: true,
                initially: "deferred"
            }
        }
    },
    {
        str: "id_company integer not null references company ( id ) deferrable initially deferred default 1",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                column: {word: "id"},
                deferrable: true,
                initially: "deferred"
            },
            default: {elements: [
                {number: "1"}
            ]}
        }
    },
    {
        str: "id_company integer not null references company ( id ) match simple deferrable initially deferred default 1",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                column: {word: "id"},
                deferrable: true,
                initially: "deferred",
                match: "simple"
            },
            default: {elements: [
                {number: "1"}
            ]}
        }
    },
    {
        str: "id_company integer not null references company on delete no action",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                onDelete: "no action"
            }
        }
    },
    {
        str: "id_company integer not null references company on delete restrict",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                onDelete: "restrict"
            }
        }
    },
    {
        str: "id_company integer not null references company on delete cascade",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                onDelete: "cascade"
            }
        }
    },
    {
        str: "id_company integer not null references company on delete set  Null",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                onDelete: "set null"
            }
        }
    },
    {
        str: "id_company integer not null references company on delete set  defaulT",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                onDelete: "set default"
            }
        }
    },
    {
        str: "id_company integer not null references company on update no action",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                onUpdate: "no action"
            }
        }
    },
    {
        str: "id_company integer not null references company on update restrict",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                onUpdate: "restrict"
            }
        }
    },
    {
        str: "id_company integer not null references company on update cascade",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                onUpdate: "cascade"
            }
        }
    },
    {
        str: "id_company integer not null references company on update set  Null",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                onUpdate: "set null"
            }
        }
    },
    {
        str: "id_company integer not null references company on update set  defaulT",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                onUpdate: "set default"
            }
        }
    },
    {
        str: "id_company integer not null references company on delete cascade on update set default",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                onDelete: "cascade",
                onUpdate: "set default"
            }
        }
    },
    {
        str: "id_company integer not null references company on update set default on delete cascade",
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                onDelete: "cascade",
                onUpdate: "set default"
            }
        }
    },
    {
        str: `id_company integer
        not null
        references company ( id )
        match simple
        on update set default
        on delete cascade
        deferrable
        initially deferred
        default 1`,
        result: {
            name: {word: "id_company"},
            type: {
                type: "integer"
            },
            notNull: true,
            references: {
                table: {link: [
                    {word: "company"}
                ]},
                column: {word: "id"},
                deferrable: true,
                initially: "deferred",
                match: "simple",
                onDelete: "cascade",
                onUpdate: "set default"
            },
            default: {elements: [
                {number: "1"}
            ]}
        }
    }
];
