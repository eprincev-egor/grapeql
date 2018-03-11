"use strict";
    
const SERVER_1 = {
    schemes: {
        public: {
            tables: {
                company: {
                    columns: {
                        id: {
                            type: "integer",
                            name: "id",
                            table: "company",
                            scheme: "public"
                        },
                        inn: {
                            type: "text",
                            name: "inn",
                            table: "company",
                            scheme: "public"
                        },
                        id_country: {
                            type: "integer",
                            name: "id_country",
                            table: "company",
                            scheme: "public"
                        }
                    },
                    constraints: {
                        company_pk: {
                            type: "primary key",
                            name: "company_pk",
                            columns: ["id"]
                        }
                    }
                },
                country: {
                    columns: {
                        id: {
                            type: "integer",
                            name: "id",
                            table: "country",
                            scheme: "public"
                        }
                    },
                    constraints: {
                        country_pk: {
                            type: "primary key",
                            name: "country_pk",
                            columns: ["id"]
                        }
                    }
                },
                order: {
                    columns: {
                        id: {
                            type: "integer",
                            name: "id",
                            table: "order",
                            scheme: "public"
                        },
                        id_client: {
                            type: "integer",
                            name: "id_client",
                            table: "order",
                            scheme: "public"
                        },
                        id_country_start: {
                            type: "integer",
                            name: "id_country_start",
                            table: "order",
                            scheme: "public"
                        },
                        id_country_end: {
                            type: "integer",
                            name: "id_country_end",
                            table: "order",
                            scheme: "public"
                        }
                    },
                    constraints: {
                        order_pk: {
                            type: "primary key",
                            name: "order_pk",
                            columns: ["id"]
                        }
                    }
                },
                order_partners: {
                    columns: {
                        id_company: {
                            type: "integer",
                            name: "id_company",
                            table: "order_partners",
                            scheme: "public"
                        },
                        id_order: {
                            type: "integer",
                            name: "id_order",
                            table: "order_partners",
                            scheme: "public"
                        }
                    },
                    constraints: {
                        order_partners_uniq: {
                            type: "unique",
                            name: "order_pk",
                            columns: ["id_company", "id_order"]
                        }
                    }
                }
            }
        },
        test: {
            tables: {
                company: {
                    columns: {
                        id: {
                            type: "integer",
                            name: "id",
                            table: "company",
                            scheme: "test"
                        }
                    },
                    constraints: {
                        company_pk: {
                            type: "primary key",
                            name: "company_pk",
                            columns: ["id"]
                        }
                    }
                }
            }
        }
    }
};
    
module.exports = SERVER_1;