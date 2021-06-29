const toursScheme = require('../models/tours.model');
let arrTours = [
    [{
        text: '↩️На главную',
        callback_data: 'На главную'
    }],
]




module.exports = {
    pay: [
        [
            {
                text: '✅Оплатить',
                callback_data: 'pay'
            }
        ],
        [
            {
                text: '❌Отмена',
                callback_data: 'cancel'
            }
        ]
    ],
    paysmm: [
        [
            {
                text: '✅Оплатить',
                callback_data: 'paysmm'
            }
        ],
        [
            {
                text: '❌Отмена',
                callback_data: 'cancel'
            }
        ]
    ],
    add_funds: [
        [
            {
                text: '✅Пополнить',
                callback_data: 'add_funds'
            }
        ],
        [
            {
                text: '❌Отмена',
                callback_data: 'cancel'
            }
        ]
    ],
    create_ref: [
        [
            {
                text: '✅Получить ссылку',
                callback_data: 'takeRef'
            }
        ],
        [
            {
                text: '🧮Мои рефералы',
                callback_data: 'clientRefs'
            }
        ],
        [
            {
                text: '↩️Назад',
                callback_data: 'back'
            }
        ]

    ],
    help: [
        [
            {
                text: '💡Инструкция',
                callback_data: 'Instructions'
            }
        ],
        [
            {
                text: '👤 Служба поддержки - чат',
                url: "https://t.me/mixtripsupport"
            }
        ],
        [
            {
                text: '↩️Назад',
                callback_data: 'back'
            }
        ]
    ],
    general: {
        home_menu: '💡Главное меню',
    },
    admin: {
        Add_tour: 'Добавить Тур',
        Add_eventsB: 'Добавить Мероприятие',
        Add_Balance: '💰Добавить Средства',
        Add_business_Camps: 'Добавить Business Camp',
        delit_business_Camps: 'Удалить Business Camp',
        delite_tour: 'Удалить Тур',
        delite_event: 'Удалить Мероприятие',
        edit_tour: 'Редактировать Тур',
        AllUser: '👥How many users',
        home_menu: '💡Главное меню',
        Announcement: '📣Announcement',
        Announcement_preview: '📢Announcement Preview',
        ref_reg: '📢Рефералы',
        clear_reg: '📢Очистить рефералку',

    },
    back: [
        [
            {
                text: '↩️Назад',
                callback_data: 'back'
            }
        ]
    ],
    taskbutton: [
        [
            {
                text: 'Гайды',
                callback_data: 'myGuideF'
            }
        ],
        [
            {
                text: 'Забронированные туры',
                callback_data: 'myPreOrdTour'
            }
        ],
        [
            {
                text: '↩️Назад',
                callback_data: 'back'
            }
        ]
    ],
    homepage: [
        [
            {
                text: '✈️ Туры',
                callback_data: 'tours'
            },
        ],
        [
            {
                text: '🎉 Мероприятия',
                callback_data: 'events'
            },
            {
                text: '⛺ Business Camp',
                callback_data: 'Business_Camp'
            }
        ],
        [
            {
                text: '👤 Профиль',
                callback_data: 'профиль'
            }
        ],
        [
            {
                text: '⁉️ FAQ',
                callback_data: 'faq'
            },

        ],
    ],
    profile: [
        [
            {
                text: '💵Пополнить баланс',
                callback_data: 'add_funds'
            }
        ],
        [
            {
                text: '🛒История заказов',
                callback_data: 'История заказов'
            },
            {
                text: '💸История пополнения',
                callback_data: 'История пополнения'
            }
        ],
        [
            {
                text: '📈Реферальная система',
                callback_data: 'CreateRef'
            }
        ],
        [
            {
                text: '↩️На главную',
                callback_data: 'На главную'
            }
        ]
    ],
    add_tours: [
        [
            {
                text: 'Добавить Гайд',
                callback_data: 'add_guide'
            }
        ],
        [
            {
                text: 'Добавить Экспедицию',
                callback_data: 'add_expedition'
            }
        ],
        [
            {
                text: 'Редактировать Экспедицию',
                callback_data: 'editSs_expedition'
            }
        ],
        [
            {
                text: 'Редактировать Описание Туров',
                callback_data: 'editSs_infoTours'
            }
        ],
        [
            {
                text: '🛒Admin',
                callback_data: '🛒Admin'
            }
        ],
    ],

};
