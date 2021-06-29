const kb = require('./keyboard_buttons');

module.exports = {
    homepage: [
        [kb.general.home_menu],
    ],
    profile: [
        [kb.profile],
    ],
    help: [
        [kb.help],
    ],
    back: [
        [kb.back]
    ],
    pay: [kb.pay],
    add_funds: [kb.add_funds],
    admin: [
        [kb.general.home_menu],
        [kb.admin.Announcement, kb.admin.Announcement_preview],
        [kb.admin.AllUser],
        [kb.admin.ref_reg,kb.admin.clear_reg],
        [kb.admin.Add_tour, kb.admin.edit_tour,kb.admin.delite_tour],
        [kb.admin.Add_eventsB, kb.admin.delite_event],
        [kb.admin.Add_business_Camps, kb.admin.delit_business_Camps],
    ],
};
