import XLSX from "xlsx";

export const exportToXLSX = (sales) => {
    const data = sales.map(s => ({
        id: s._id.toString(),
        userId: s.userId,
        total: s.total,
        paymentStatus: s.payment?.status || "",
        date: s.createdAt
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "sales");
    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
};
