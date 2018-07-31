
export default class Pool {
    constructor(entityClass, parent, number){
        
        this.pool = [];
        
        let i = number;
        while(i--){
            const ent = new entityClass({
                parent: parent,
                active: false
            })
            ent.inUse = false;
            this.pool.push(ent);
        }
    }

    getEntity(){
        // Check if the pool is empty
        // TODO: Instantiate new object if pool is empty
        if(this.pool.length <= 0) return;
        // Get the first unused item
        let ent = undefined;
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].inUse) {
                ent = this.pool[i];
                break;
            }
        }
        if(ent === undefined) return;
        ent.setActive(true);
        ent.inUse = true;
        return ent;
    }

    putEntity(ent){
        // Disable the entity
        ent.setActive(false);
        // Set it back to idle
        ent.inUse = false;
    }

}