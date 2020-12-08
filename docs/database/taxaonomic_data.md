---
title: Taxonomic Data
---

The way that taxonomic data are stored in the NAMC database is of fundamental importance to the overall performance and maintainability of the entire system. The old method of storing taxonomic data was inefficient and error prone. The new method uses an industry standard method for managing hierarchical data. The following video explains the differences. Below are two of the important queries that make it possible to store the data in the new efficient format, but still view and work with it in the ways in which NAMC are familiar.

<div class="responsive-embed widescreen">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/BldTVDK5A_w" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

## Recusrive Function

The following [function](https://www.postgresql.org/docs/9.1/sql-createfunction.html) walks up the taxonomic hierarchy accumulating all taxa higher in the hierarchy:

```sql

CREATE OR REPLACE FUNCTION taxa_tree(t INT)
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
```

This function can be called for a particular taxa with the following simple query:

```sql
SELECT * FROM taxa_tree(41);
```

and the result looks like this:

| tid | lid | pid |
| :--- | :--- | :--- |
| 1 | 5 | NULL |
| 8 | 9 | 1 |
| 5711 | 14 | 8 |
| 662 | 19 | 5711 |
| 41 | 23 | 662 |

This can be expanded with some joins to show the taxa for each level of the hierarchy for the individual taxa:

```sql
SELECT t.taxonomy_id, l.level_name, ttt.scientific_name
FROM taxa.taxonomy t,
     taxa_tree(t.taxonomy_id) tt
         INNER JOIN taxa.taxa_levels l ON tt.lid = l.level_id
         INNER JOIN taxa.taxonomy ttt ON tt.tid = ttt.taxonomy_id
WHERE t.taxonomy_id = 41;
```

to produce:

| taxonomy\_id | level\_name | scientific\_name |
| :--- | :--- | :--- |
| 41 | Phylum | Annelida |
| 41 | Class | Clitellata |
| 41 | Suborder | Tubificina |
| 41 | Family | Naididae |
| 41 | Genus | Branchiura |

## Cross Tab Pivot View

Calling the aforementioned recursive function through a [crosstab](https://www.postgresql.org/docs/9.2/tablefunc.html) query produces a pivoted view of the entire taxonomic hierarchy in the original formatted that NAMC used to store the data.

```sql
SELECT *
FROM crosstab('
SELECT t.taxonomy_id, l.level_name, ttt.scientific_name
FROM taxa.taxonomy t,
     taxa_tree(t.taxonomy_id) tt
         INNER JOIN taxa.taxa_levels l ON tt.lid = l.level_id
         INNER JOIN taxa.taxonomy ttt ON tt.tid = ttt.taxonomy_id
ORDER BY t.taxonomy_id limit 100',
'SELECT level_name FROM taxa.taxa_levels where is_active = TRUE  and level_id > 1 order BY level_id')
         AS final_result(Code INT,
                         Phylum varchar(255),
                         Class varchar(255),
                         Subclass varchar(255),
                         "Order" varchar(255),
                         Suborder varchar(255),
                         Family varchar(255),
                         Subfamily varchar(255),
                         Tribe varchar(255),
                         Genus varchar(255),
                         Subgenus varchar(255),
                         Species varchar(255),
                         Subspecies varchar(255)
        );
```

to produce: 

| code | phylum | class | subclass | Order | suborder | family | subfamily | tribe | genus | subgenus | species | subspecies |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Annelida | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
| 4 | Annelida | Polychaeta | NULL | Aeolosomatida | NULL | Aeolosomatidae | NULL | NULL | NULL | NULL | NULL | NULL |
| 5 | Annelida | Clitellata | Lumbriculata | Branchiobdellida | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
| 6 | Annelida | Clitellata | Lumbriculata | Branchiobdellida | NULL | Branchiobdellidae | NULL | NULL | NULL | NULL | NULL | NULL |
| 7 | Annelida | Clitellata | Lumbriculata | Branchiobdellida | NULL | Branchiobdellidae | NULL | NULL | Xironogiton | NULL | NULL | NULL |
| 8 | Annelida | Clitellata | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
| 9 | Annelida | Clitellata | Lumbriculata | Hirudinida | Arhynchobdellida | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
| 10 | Annelida | Clitellata | Lumbriculata | Hirudinida | Arhynchobdellida | Haemopidae | NULL | NULL | NULL | NULL | NULL | NULL |
| 12 | Annelida | Clitellata | Lumbriculata | Hirudinida | Arhynchobdellida | Erpobdellidae | NULL | NULL | NULL | NULL | NULL | NULL |
| 13 | Annelida | Clitellata | Lumbriculata | Hirudinida | Arhynchobdellida | Erpobdellidae | NULL | NULL | Dina | NULL | NULL | NULL |
| 14 | Annelida | Clitellata | Lumbriculata | Rhynchobdellida | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
| 15 | Annelida | Clitellata | Lumbriculata | Hirudinida | NULL | Glossiphoniidae | NULL | NULL | NULL | NULL | NULL | NULL |
| 16 | Annelida | Clitellata | Lumbriculata | Hirudinida | NULL | Glossiphoniidae | NULL | NULL | Batracobdella | NULL | NULL | NULL |
| 17 | Annelida | Clitellata | Lumbriculata | Hirudinida | NULL | Glossiphoniidae | Glossiphoniinae | NULL | Glossiphonia | NULL | NULL | NULL |
| 18 | Annelida | Clitellata | Lumbriculata | Hirudinida | NULL | Glossiphoniidae | NULL | NULL | Helobdella | NULL | NULL | NULL |
| 19 | Annelida | NULL | Oligochaeta | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
| 20 | Annelida | Clitellata | Lumbriculata | Lumbriculida | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
| 21 | Annelida | Clitellata | Lumbriculata | Lumbriculida | NULL | Lumbriculidae | NULL | NULL | NULL | NULL | NULL | NULL |
| 22 | Annelida | Clitellata | Lumbriculata | Lumbriculida | NULL | Lumbriculidae | NULL | NULL | Lumbriculus | NULL | NULL | NULL |
| 23 | Annelida | Clitellata | Lumbriculata | Lumbriculida | NULL | Lumbriculidae | NULL | NULL | Stylodrilus | NULL | NULL | NULL |
| 24 | Annelida | Clitellata | NULL | Haplotaxida | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
