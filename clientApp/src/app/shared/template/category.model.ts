export interface CategoryResponse{
    status: string,
    message: string,
    category: Subcategory[];
}
export class Category{
    id: number;
    name: string;
    type: string;
    children: Subcategory[];

}
export class Subcategory{
    id: number;
    category_id: number;
    mapping_id: number;
    name: string;
    type: string;
}

