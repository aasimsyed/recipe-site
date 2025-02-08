-- Remove main-course category and its relationships
DELETE FROM "_CategoryToRecipe" WHERE "A" IN (SELECT "id" FROM "Category" WHERE "slug" = 'main-course');
DELETE FROM "Category" WHERE "slug" = 'main-course'; 