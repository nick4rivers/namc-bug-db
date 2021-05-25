---
title: Taxonomic Hierarchy Review
---

# 1. Review Taxa

Review all 5,663 taxa in the taxonomy table:

1. Are the scientific names correct?
1. Are the parents identified correctly?

# 2. Review Translations

What was previously called an OTU is now called a translation. Translations serve two purposes: 1) They allow roll ups of taxa to higher levels, and 2) they allow aliases to be applied when a model or report requires a different name.

1. Review all records in the `translations` table. This is more about familiarization because these data cam from Trip and should be reliable.

# 3. Review Translation Taxa

This is the big one! 

The `translation_taxa` table requires a record for each taxa that should appear in a translation (OTU). So if an OTU specifies 150 taxa then there should be 150 records for the corresponding translation in the `translation_taxa` table.

If a translation is intended to simply alias one or more taxa, then the translation_taxa tables needs an entry for **EVERY** taxa that is required in the final taxonomic listing, not just those that have an alias.

So if this is a raw taxonomic hierarchy:

| Level  | Scientific Name  |
| ------ | ---------------- |
| Phylum | Annelia          |
| Class  | Oligochaeta      |
| Order  | Glossoscolecidae |



And we want a translation that includes **ALL** these taxa but simply renames the Class *Oligochaeta* to "special class" then we would create a new translation "my cool translation" with the following records in `translation_taxa`:



| Translation         | Original Scientific Name | Translation Taxonomy Name |
| ------------------- | ------------------------ | ------------------------- |
| my cool translation | Annelia                  |                           |
| my cool translation | Oligochaeta              | special class             |
| my cool translation | Glossoscolecidae         |                           |

The key points here are that each taxa that is needed in the translation must appear in `translation_taxa` table even if they don't rename the taxa. If a taxa does need a new name then it is specified in the `translation_taxonomy_name` column.


# Video Explanation of Translations v OTUs

<div class="responsive-embed">
<iframe width="560" height="315" src="https://www.youtube.com/embed/hwBUAunurUw" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>
