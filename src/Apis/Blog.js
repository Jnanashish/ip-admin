import { get, post, updateData, deleteData } from "../Helpers/request";
import { apiEndpoint } from "../Helpers/apiEndpoints";

export const getBlogList = async (params) => {
    let url = apiEndpoint.getBlogList;
    if (params) url += `?${new URLSearchParams(params)}`;
    return await get(url, "Blog list");
};

export const getBlogById = async (id) => {
    return await get(`${apiEndpoint.getBlogById}/${id}`, "Blog");
};

export const createBlog = async (data) => {
    return await post(apiEndpoint.addBlog, data, "Blog create");
};

export const updateBlog = async (id, data) => {
    return await updateData(`${apiEndpoint.updateBlog}/${id}`, data, "Blog update");
};

export const deleteBlog = async (id) => {
    return await deleteData(`${apiEndpoint.deleteBlog}/${id}`, "Blog delete");
};

export const archiveBlogs = async (ids) => {
    return await post(apiEndpoint.archiveBlogs, { ids }, "Blog archive");
};

export const uploadBlogImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return await post(apiEndpoint.uploadBlogImage, formData, "Image upload");
};

export const getBlogCategories = async () => {
    return await get(apiEndpoint.getBlogCategories);
};

export const getBlogTags = async () => {
    return await get(apiEndpoint.getBlogTags);
};
