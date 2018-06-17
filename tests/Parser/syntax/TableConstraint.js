"use strict";

module.exports = [
    {
        str: "check(name is not null)",
        result: {
            check: {elements: [
                {link: [
                    {word: "name"}
                ]},
                {operator: "is not"},
                {null: true}
            ]}
        }
    },
    {
        str: "constraint name_not_null check(name is not null)",
        result: {
            name: {word: "name_not_null"},
            check: {elements: [
                {link: [
                    {word: "name"}
                ]},
                {operator: "is not"},
                {null: true}
            ]}
        }
    },
    {
        str: "unique(name)",
        result: {
            unique: {
                columns: [{word: "name"}]
            }
        }
    },
    {
        str: "constraint uniq_name unique(name)",
        result: {
            name: {word: "uniq_name"},
            unique: {
                columns: [{word: "name"}]
            }
        }
    },
    {
        str: "primary key(id)",
        result: {
            primaryKey: {
                columns: [{word: "id"}]
            }
        }
    },
    {
        str: "constraint id_pk primary key(id)",
        result: {
            name: {word: "id_pk"},
            primaryKey: {
                columns: [{word: "id"}]
            }
        }
    },
    {
        str: "foreign key (id_company) references company",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]}
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company (id)",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    columns: [{word: "id"}]
                }
            }
        }
    },
    {
        str: "constraint company_fk foreign key (id_company) references company (id)",
        result: {
            name: {word: "company_fk"},
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    columns: [{word: "id"}]
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company (id) match full",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    columns: [{word: "id"}],
                    match: "full"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company (id) match simple",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    columns: [{word: "id"}],
                    match: "simple"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company (id) match partial",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    columns: [{word: "id"}],
                    match: "partial"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company match partial",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    match: "partial"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company on delete no action",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onDelete: "no action"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company on delete restrict",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onDelete: "restrict"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company on delete cascade",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onDelete: "cascade"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company on delete set  Default",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onDelete: "set default"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company on delete set  nuLl",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onDelete: "set null"
                }
            }
        }
    },
    
    
    {
        str: "foreign key (id_company) references company on update no action",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onUpdate: "no action"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company on update restrict",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onUpdate: "restrict"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company on update cascade",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onUpdate: "cascade"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company on update set  Default",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onUpdate: "set default"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company on update set  nuLl",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onUpdate: "set null"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company (id) on update no Action on delete no  acTion",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onUpdate: "no action",
                    onDelete: "no action"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company (id) on delete no  acTion on update no Action",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onUpdate: "no action",
                    onDelete: "no action"
                }
            }
        }
    },
    {
        str: "foreign key (id_company) references company (id) match full on delete no  acTion on update no Action",
        result: {
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onUpdate: "no action",
                    onDelete: "no action",
                    match: "full"
                }
            }
        }
    },
    {
        str: `constraint company_fk 
        foreign key (id_company) 
        references company (id) 
        match full 
        on delete no  acTion 
        on update no Action`,
        result: {
            name: {word: "company_fk"},
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onUpdate: "no action",
                    onDelete: "no action",
                    match: "full"
                }
            }
        }
    },
    {
        str: "unique(name) deferrable",
        result: {
            unique: {
                columns: [{word: "name"}]
            },
            deferrable: true
        }
    },
    {
        str: "unique(name) not deferrable",
        result: {
            unique: {
                columns: [{word: "name"}]
            },
            deferrable: false
        }
    },
    {
        str: "unique(name) initially immediate",
        result: {
            unique: {
                columns: [{word: "name"}]
            },
            initially: "immediate"
        }
    },
    {
        str: "unique(name) initially deferred",
        result: {
            unique: {
                columns: [{word: "name"}]
            },
            initially: "deferred"
        }
    },
    {
        str: "unique(name) deferrable initially deferred",
        result: {
            unique: {
                columns: [{word: "name"}]
            },
            deferrable: true,
            initially: "deferred"
        }
    },
    
    {
        str: "primary key (name) deferrable",
        result: {
            primaryKey: {
                columns: [{word: "name"}]
            },
            deferrable: true
        }
    },
    {
        str: "primary key (name) not deferrable",
        result: {
            primaryKey: {
                columns: [{word: "name"}]
            },
            deferrable: false
        }
    },
    {
        str: "primary key (name) initially immediate",
        result: {
            primaryKey: {
                columns: [{word: "name"}]
            },
            initially: "immediate"
        }
    },
    {
        str: "primary key (name) initially deferred",
        result: {
            primaryKey: {
                columns: [{word: "name"}]
            },
            initially: "deferred"
        }
    },
    {
        str: "primary key (name) deferrable initially deferred",
        result: {
            primaryKey: {
                columns: [{word: "name"}]
            },
            deferrable: true,
            initially: "deferred"
        }
    },
    
    {
        str: `constraint company_fk 
        foreign key (id_company) 
        references company (id) 
        match full 
        on delete no  acTion 
        on update no Action
        deferrable`,
        result: {
            name: {word: "company_fk"},
            deferrable: true,
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onUpdate: "no action",
                    onDelete: "no action",
                    match: "full"
                }
            }
        }
    },
    {
        str: `constraint company_fk 
        foreign key (id_company) 
        references company (id) 
        match full 
        on delete no  acTion 
        on update no Action
        not deferrable`,
        result: {
            name: {word: "company_fk"},
            deferrable: false,
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onUpdate: "no action",
                    onDelete: "no action",
                    match: "full"
                }
            }
        }
    },
    {
        str: `constraint company_fk 
        foreign key (id_company) 
        references company (id) 
        match full 
        on delete no  acTion 
        on update no Action
        deferrable initially immediate`,
        result: {
            name: {word: "company_fk"},
            deferrable: true,
            initially: "immediate",
            foreignKey: {
                columns: [{word: "id_company"}],
                references: {
                    table: {link: [
                        {word: "company"}
                    ]},
                    onUpdate: "no action",
                    onDelete: "no action",
                    match: "full"
                }
            }
        }
    }
];
