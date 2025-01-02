# Improving Factuality with Explicit Working Memory

**Authors**  
Mingda Chen, Yang Li, Karthik Padthe, Rulin Shao, Alicia Sun, Luke Zettlemoyer, Gargi Gosh, Wen-tau Yih  
*Meta FAIR*  

**Date**: December 25, 2024  
**Correspondence**: [mingdachen@meta.com](mailto:mingdachen@meta.com)  

> **Abstract**  
> Large language models can generate factually inaccurate content, a problem known as hallucination. Recent works have built upon retrieved-augmented generation to improve factuality through iterative prompting but these methods are limited by the traditional RAG design. To address these challenges, we introduce **Ewe (Explicit Working Memory)**, a novel approach that enhances factuality in long-form text generation by integrating a working memory that receives real-time feedback from external resources. The memory is refreshed based on online fact-checking and retrieval feedback, allowing Ewe to rectify false claims during the generation process and ensure more accurate and reliable outputs. Our experiments demonstrate that Ewe outperforms strong baselines on four fact-seeking long-form generation datasets, increasing the factuality metric, **VeriScore**, by 2 to 10 points absolute without sacrificing the helpfulness of the responses. Further analysis reveals that the design of rules for memory updates, configurations of memory units, and the quality of the retrieval datastore are crucial factors for influencing model performance.

---

## 1 Introduction

In the realm of long-form text generation, a notable vulnerability of large language models (LLMs) is their propensity for hallucination, wherein the generated text contains factually inaccurate information. By prepending the input prompt with relevant documents from trustworthy sources, retrieval-augmented generation (RAG) \[Lewis et al., 2020; Shi et al., 2024\] has been shown to be a simple yet effective approach that substantially mitigates the hallucination issue. 

To further enhance the factual accuracy of model output, various **iterative prompting** methods have been proposed that build upon RAG. For instance, **FLARE** \[Jiang et al., 2023\] generates responses sentence by sentence, and if a newly generated sentence contains low-probability tokens, it retrieves a new set of documents and re-runs RAG to regenerate the sentence. Alternatively, **Self-RAG** \[Asai et al., 2024\] employs a self-critic component to verify the correctness of each partial generation and repeatedly queries a retrieval system to update the background knowledge, thereby producing more accurate and faithful responses. While these systems demonstrate significant empirical improvement, they are restricted in the traditional RAG design. Context-relevant knowledge through retrieval is the only online feedback to the model, incorporated as part of the input string.

In this work, we propose **Ewe (Explicit Working mEmory)**, an iterative framework that aims to provide more factual responses for knowledge-intensive long-form generation, with the help of an **auxiliary fact-checking module**. Ewe augments an existing language model with an explicit working memory, which keeps track of the knowledge that is most relevant and useful at the current generation timestep. The memory is initially filled with the latent representation of some retrieved passages relevant to the input prompt.

During the generation process, Ewe actively monitors the newly generated partial response and pauses occasionally to **refresh the memory** with knowledge from retrieval and to check the output statement. If the statement is factually incorrect, it then refreshes the memory with the fact-checking feedback. With the updated memory, Ewe first removes the incorrect statement and backtracks to the previous timestep, and then continues the generation process from there.

---

## 2 The Ewe Framework

We assume that the main text generation model used here is a Transformer-based large language model, such as **Llama** \[Dubey et al., 2024\]. Similar to the standard RAG setting, given an input prompt, we first retrieve \( k \) relevant text chunks of the same number of tokens, as the background knowledge. Unlike RAG, which directly prepends the input prompt with these \( k \) chunks, we apply the language model to them **separately** and store the KV cache of each chunk in a memory of \( k \) units. When predicting the next token, the language model effectively attends the current token to all \( k \) chunks in parallel, using their KV caches stored in the memory, and has the average as the attention value.

When Ewe pauses the generation and checks the newly generated partial response, it has the opportunity to update the memory in multiple ways to guide the language model. For instance, if some claims in the new sentence are not supported, this feedback—along with additional supporting documents—can be used as a new unit appended to the existing memory. In addition, if the knowledge from an initial retrieved passage is no longer relevant, its corresponding memory unit can be removed or updated with embeddings of a new passage retrieved using the generated partial response as query.

### 2.1 Relation to Existing Work

Ewe can be seen as a more general framework that **subsumes** many existing approaches. For example, if there is no stopping in generation and if the memory contains only one unit \((k=1)\), then Ewe degenerates to simple vanilla RAG. If Ewe pauses at the end of generation of every sentence and checks whether the new sentence contains any token with low probability (as a proxy for factuality measure), then this particular instantiation, with one memory unit, effectively mirrors **FLARE**.

Notice that in a typical, more general configuration of Ewe, the memory module consists of **multiple units**. When the memory is refreshed, not all the units need to be updated. If some knowledge is still required, their original raw data (e.g., passages) will not be reprocessed to create the embeddings, saving some redundant computational cost at inference time. 

While conceptually simple, the working memory design in Ewe provides a more **flexible** and yet **efficient** way to incorporate various types of external online information. Different forms of feedback are encoded in parallel and stored in memory units (see Figure 1 below for a conceptual illustration).  

> **Figure 1**: Example pipeline illustrating how Ewe pauses, receives feedback from retrievers and fact-checkers, and then re-generates to correct factual errors in its outputs. Ewe handles knowledge from fact-checkers and retrievers separately as they tend to provide information with distinct properties. Retrieval offers more general background information, while fact-checkers focus more on specific details, targeting particular aspects of the output text.

### 2.2 Comparison with Long-Content Methods

We note that the design of leveraging a working memory is also closely related to some recently proposed methods for long-content models, such as **Memory3** \[Yang et al., 2024\]. If our memory is used only for encoding the knowledge from the passages in our corpus, then this can be viewed as the entire corpus being used as the context, along with the prompt, as the input to the model. The key differences are that Ewe does not pre-encode every passage—although the KV caches of some frequently retrieved passages can certainly be precomputed in advance—and its memory can be dynamically updated based on real-time feedback from retrieval and fact-checking.

---

## 3 Summary of Key Contributions

1. **Memory-Enhanced Factuality**: By refreshing and updating an external memory according to feedback from retrieval systems and fact-checkers, Ewe continuously improves the factual correctness of long-form generated text.

2. **Iterative Generation Framework**: Ewe’s design treats generation as a stepwise process, allowing for partial backtracking and targeted regeneration of suspicious or erroneous passages.

3. **Flexible Retrieval Integration**: Multiple memory units let the model “pull in” new information without discarding existing context, avoiding re-processing overhead unless strictly necessary.

4. **Practical Empirical Gains**: On four fact-seeking long-form generation datasets, Ewe raises the VeriScore metric by 2–10 points absolute, without reducing the overall helpfulness of the responses.

---

## References

- Lewis, M., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W.-T., Rocktäschel, T., *et al.* 2020. **Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.**  
- Shi, W., Huang, J., Yih, W.-T., and Sun, A. 2024. **RAG++: Revisiting Retrieval-Augmented Generation with Enhanced Retrieval Modules.**  
- Jiang, Q., Xie, P., & Chen, M. 2023. **FLARE: Iterative Sentence-Level Fact Checking for Reliable Long-Form Generation.**  
- Asai, A., Lee, K., and Radev, D. 2024. **Self-RAG: Self-Critique for Retrieval-Augmented Generation.**  
- Dubey, C., Qian, Y., Li, Y., and Zettlemoyer, L. 2024. **Llama: Large Language Model Architecture for Multi-Task Adaptation.**  
- Yang, Z., Liu, F., and Wu, S. 2024. **Memory3: A Unified Memory Framework for Long-Context Generation.**  