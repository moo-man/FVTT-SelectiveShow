Hooks.on("ready", () => {
    JournalEntry.prototype.show = async function (mode = "text", force = false) 
    {
        if (!this.owner) throw new Error(game.i18n.localize("selectiveshow.MustBeAnOwnerError"));
        let selection = await new Promise(resolve => {
            new SelectiveShowApp(resolve).render(true);
        })

        game.socket.emit("module.selectiveshow", {id : this.uuid, mode, force, selection})
    }

    game.socket.on("module.selectiveshow", ({id, mode, force, selection}) => {
        if (selection.includes(game.user._id))
            Journal._showEntry(id, mode, force)
    })
    
})


class SelectiveShowApp extends Application {

    constructor (resolve)
    {
        super();
        this.selection = resolve
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "selective-show";
        options.template = "modules/selectiveshow/selectiveshow.html"
        options.classes.push("selective-show");
        options.height = 300;
        options.width = 250;
        options.minimizable = true;
        options.resizable = true;
        options.title = game.i18n.localize("selectiveshow.SelectiveShow")
        return options;
    }

    getData() {
        let data = super.getData();
        data.users = game.users.entities.filter(u => u.active && u.data._id != game.user._id);
        return data;
    }

     activateListeners(html) {
         super.activateListeners(html);    

         html.find(".show").click(ev => {
             ev.preventDefault();
             let selector = $(ev.currentTarget).parents("form").find("select");
             this.selection(selector.val());
             this.close();
         })
         html.find(".show-all").click(ev => {
            ev.preventDefault();
            this.selection(game.users.entities.filter(u => u.active && u.data._id != game.user._id).map(u => u.id));
            this.close();
        })
    }
}
