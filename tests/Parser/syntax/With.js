"use strict";

module.exports = [
    {
        str: "with X as (select 1)",
        result: {
            queries: {
                x: {
                    name: {word: "X"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {word: "X"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        str: "with \"X\" as (select 1)",
        result: {
            queries: {
                X: {
                    name: {content: "X"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {content: "X"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        str: "with x as (select 1), y as (select 2)",
        result: {
            queries: {
                x: {
                    name: {word: "x"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                },
                y: {
                    name: {word: "y"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "2"}
                                ]}
                            }
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {word: "x"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                },
                {
                    name: {word: "y"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "2"}
                                ]}
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        str: "with y as (select 2), x as (select 1)",
        result: {
            queries: {
                x: {
                    name: {word: "x"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                },
                y: {
                    name: {word: "y"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "2"}
                                ]}
                            }
                        ]
                    }
                }
            },
            queriesArr: [
                {
                    name: {word: "y"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "2"}
                                ]}
                            }
                        ]
                    }
                },
                {
                    name: {word: "x"},
                    select: {
                        columns: [
                            {
                                expression: {elements: [
                                    {number: "1"}
                                ]}
                            }
                        ]
                    }
                }
            ]
        }
    },

    {
        str: "with x as (select 2), x as (select 1)",
        error: Error
    }
];
