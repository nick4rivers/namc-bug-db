/******************************************************************************************************************
taxa SCHEMA
*/
CREATE FUNCTION Taxa.fnTree(t INT)
    returns table (tid INT, lid INT, pid INT)
    language plpgsql
as
$$
begin
    RETURN QUERY
        SELECT (taxa_tree(taxa.parent_id)).* FROM taxa.taxonomy taxa WHERE taxa.taxonomy_id = t;

    RETURN QUERY
        SELECT taxonomy_id, level_id, parent_id FROM taxa.taxonomy WHERE taxonomy_id = t;
end
$$;