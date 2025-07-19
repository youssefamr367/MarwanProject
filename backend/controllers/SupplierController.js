import Supplier from "../models/SupplierModel.js";

class SupplierController {
    static async createSupplier(req, res) {
        try {
            const sup = await Supplier.create(req.body);
            res.status(201).json(sup);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async getAllSuppliers(req, res) {
        try {
            const all = await Supplier.find();
            res.json(all);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async updateSupplier(req, res) {
        try {
            const u = await Supplier.findByIdAndUpdate(
                req.params.id, req.body,
                { new: true, runValidators: true }
            );
            if (!u) return res.status(404).json({ message: "Supplier not found" });
            res.json(u);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    static async deleteSupplier(req, res) {
        try {
            const d = await Supplier.findByIdAndDelete(req.params.id);
            if (!d) return res.status(404).json({ message: "Supplier not found" });
            res.json({ message: "Deleted." });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}

export default SupplierController;
