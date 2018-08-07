
export default class Pool {
    constructor(entityClass, parent, number){
        
        this._pool = [];
        this._entity = entityClass;
        this.parent = parent;
        
        let i = number;
        while(i--){
            this.fill();
        }
    }

    fill(){
        const ent = new this._entity({
            parent: this.parent,
            active: false
        })
        ent.inUse = false;
        this._pool.push(ent);
    }

    getEntity(){
        // Check if the pool is empty
        // TODO: Instantiate new object if pool is empty
        if(this._pool.length <= 0) this.fill();
        // Get the first unused item
        let ent = undefined;
        for (let i = 0; i < this._pool.length; i++) {
            if (!this._pool[i].inUse) {
                ent = this._pool[i];
                break;
            }
        }
        if(ent === undefined){
            this.fill();
            return this.getEntity();
        }
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