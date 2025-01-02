# Long-Range Tasks Using Short-Context LLMs:  
Incremental Reasoning With Structured Memories

**Dulhan Jayalath\***  
*University of Oxford*  
dulhan@robots.ox.ac.uk  

**James B. Wendt, Nicholas Monath, Sandeep Tata & Beliz Gunel**  
*Google DeepMind*  
bgunel@google.com  

> **Abstract**  
> Long-range tasks require reasoning over long inputs. Existing solutions either need large compute budgets, training data, access to model weights, or use complex, task-specific approaches. We present **PRISM**, which alleviates these concerns by processing information as a stream of chunks, maintaining a structured in-context memory specified by a typed hierarchy schema. This approach demonstrates superior performance to baselines on diverse tasks while using at least 4× smaller contexts than long-context models. Moreover, PRISM is token-efficient. By producing short outputs and efficiently leveraging key-value (KV) caches, it achieves up to 54% cost reduction when compared to alternative short-context approaches. The method also scales down to tiny information chunks (e.g., 500 tokens) without increasing the number of tokens encoded or sacrificing quality. Furthermore, we show that it is possible to generate schemas to generalize our approach to new tasks with minimal effort.

---

## 1 Introduction

Problems requiring long information contexts are prevalent in natural language processing. The prototypical example is long document summarization, where a lengthy piece of text must be summarized into a short form. To solve this task with a large language model (LLM), the model is typically prompted with the text and outputs a summary of the content. However, this requires a model with a context long enough to fit the document. Many practitioners, as well as those in the research community, rely on models with short context lengths because they are limited by the inference cost of long-context models, open-source or on-premises requirements, local compute constraints, or other barriers.

In response, we design an approach that is task-agnostic, requires no training data, uses a small compute budget, and does not need access to model weights. Existing approaches do not satisfy these constraints together.

Our proposal uses a typical incremental processing strategy, treating information as a sequential stream of chunks, processed in the order of their appearance alongside an in-context memory of prior chunks. For example, in incremental summarization, the document may be split into consecutive segments, each fitting within context and shown to the LLM in sequence. Here, the memory is a running summary of the content seen so far.

While incremental methods are not new \[Chang et al., 2024; Hwang et al., 2024b\], existing approaches are task-specific and are not economic in terms of tokens processed. To address this in our strategy, rather than seeing a natural language memory, the LLM sees a **structured memory** of relevant prior information and outputs a proposed revision to the memory based on the current chunk (Figure 1). The memory is specified by a user-defined typed hierarchy schema, supporting any kind of long-range task. We call our approach **Processing Incrementally with Structured Memory (PRISM)**.

PRISM uses the structured memory to track salient prior information more succinctly than with natural language. Instead of the output of the LLM overwriting the memory, it proposes a structured revision which is used to programmatically revise the memory. These properties produce less verbose outputs and reduce the cognitive burden on the LLM, improving reasoning. Additionally, we design the memory to efficiently leverage prefix key-value caching \[Kwon et al., 2023; Pope et al., 2023\] by intelligently reusing key-value activations previously computed for parts of the memory that have been unchanged from prior steps. Taken together, our approach leads to both higher quality final answers and fewer tokens processed.

Our main contributions are:

- **PRISM**: an approach for solving long-range tasks that alleviates the constraints of alternatives (Table 1) and achieves better task performance (Section 4.1) and token-efficiency (Section 4.2) than comparable solutions;  
- An empirical study of encoding and decoding cost that shows that PRISM is more token-efficient than unstructured methods and scales down to shorter chunk sizes without increasing token cost (Section 4.2); and  
- Experimental evidence that PRISM can be applied easily to new tasks with LLM-generated memory schemas (Section 4.3).  

---

## 2 Related Work

There are a range of existing approaches for long-range reasoning with limited contexts that utilize memories. For **book summarization**, Chang et al. \[2024\] propose a hierarchical processing approach that leverages contextual information from previous summaries. Among other domain-specific methods, Hwang et al. \[2024a\] and Hwang et al. \[2024b\] use natural language and JSON-encoded knowledge representations respectively for updating memories online as new information arrives, while Fei et al. \[2024\] specifically target retrieval-based question-answering. Focusing on **conversational agents**, Packer et al. \[2023\] perform stateful reasoning in LLMs using function calls to read and write data to storage.

Another line of research embeds memories into the architecture or representation. He et al. \[2024\] provide a method that augments LLMs with memory embeddings to transform them into recurrent models. Similarly, Munkhdalai et al. \[2024\] utilize a latent-space memory as part of the network. Wang et al. \[2023\] go even further, designing a new model architecture with a retrieval side-network to cache and update a memory. Finally, Ivgi et al. \[2023\] propose using a language model encoder to encode overlapping chunks and fuse information with a pre-trained decoder.

---

## 3 Method

We seek to solve long-range tasks token-efficiently without long-context models using an incremental processing strategy because of the many benefits it provides (Table 1). In this incremental view, instead of seeing the entire context at once, the LLM sees contiguous segments (which we refer to as *chunks*) in sequence. Since, in each step, the LLM can only see the current chunk and not previous chunks, it must receive prior information through the previous LLM output. This output must encode any information relevant to the task that was previously seen. In the current call, this output is revised based on the information in the current chunk. The use of the previous output as a memory in this way is characteristic of solving incremental tasks using LLMs. In this section, we provide a way to structure this memory using a typed hierarchy schema and show how to efficiently process these tokens across multiple LLM calls.

### 3.1 Incremental Processing Formulation

In a typical incremental processing strategy, data arrives in increments, forming an ordered sequence of chunks \((d_1, d_2, \ldots, d_n)\). An LLM is prompted, incrementally from \(i \in \{1, \ldots, n\}\), with task instructions \(T\), the next chunk \(d_i\), and the output of the model from the previous step \(o_{i-1}\). Accordingly, the prompt is formed by a tuple \((T, d_i, o_{i-1})\). The output of the previous step acts as a natural language memory that assists in solving the task.  

This implies a definition for an **in-context memory**:

> **Definition 3.1**. An in-context memory is the tokens input to the model in an incremental step that encode the prior information seen by the model.

In this problem formulation, the memory is revised by being overwritten as the tokens decoded by the LLM in the next incremental step form the next state of the memory. The output of the final step \(o_n\) is taken as the answer or otherwise post-processed.

### 3.2 Using Structured Memories

Natural language (or unstructured) memories do not necessarily encode the most salient information for a specific task because the output format is unconstrained. This can impair task performance. We improve the typical incremental processing formulation by introducing a **structured memory** and **structured output** to increase information relevance and reduce the cognitive burden on the LLM. In PRISM, we prompt the language model at step \(i\) with a modified tuple \((T, S, m_i, d_i)\) where we replace the natural language memory \(o_{i-1}\) with a user-defined structured memory \(m_i\) specified by a typed hierarchy schema.

> **Definition 3.2**. A typed hierarchy is a structure of primitive types and simple data structures (e.g., integers, floating points, strings, and lists) in a hierarchy laid out by nested key-value maps.

> **Definition 3.3**. A structured memory \(m\) has a schema \(S\) specified with a typed hierarchy.

For example, a simple schema for narrative summarization could be `str: list<str>`—i.e., a key-value mapping of character names to strings describing events involving that character. After seeing a new story chunk, we can revise information about a character by adding to the entries for that character.

We choose to use typed hierarchies because they are easily addressable (using a path specified by keys and indices) and updatable. We specify a new schema for each task as this structure determines the information that will be encoded in the memory.

To revise the memory, instead of generating a structured memory to overwrite the prior memory with, the output of the model is a *proposed memory revision* \(r_i\), which provides a path to programmatically revise \(m_i\) with a new value.

> **Definition 3.4**. A structured memory revision \(r\) is a tuple \((p, o, v)\) where \(p\) specifies an addressable path in the memory, \(o\) is a binary operation that is either \(\text{add}\) or \(\text{update}\) and \(v\) is the value to revise the memory with.

If \(o\) is \(\text{add}\), \(p\) specifies a new path to which \(v\) is added; if \(\text{update}\), \(p\) specifies an existing path in the memory whose current value should be replaced with \(v\). After validating the proposed revision by programmatically ensuring it conforms to the expected structure, the memory \(m_i\) is revised with \(r_i\) to the next memory state \(m_{i+1}\). Figure 2 provides an overview of our approach and Figure 3 gives a concrete example. In practice, \(r_i\) may consist of more than one proposed revision. After all chunks are processed, the final state of the memory (alongside the query and a specification of the memory structure) are provided to the LLM with an instruction asking the model to give a final answer.

**Algorithm 1** shows all steps.

```text
Algorithm 1: PRISM

Require: T, q, S, (d1, d2, ..., dn)   // Task instruction, query, memory schema, and
                                     // chunks of information
1:   m1 ← {}
2:   for i = 1 to n do
3:       ri ← LLM(T, q, S, mi, di)
4:       mi+1 ← ReviseMemory(mi, ri)   // Add to or update the memory with the proposed value
5:   end for
6:   answer ← LLM(T_final, q, S, mn+1) // Generate the answer using the final memory
7:   return answer

Our approach brings several quality benefits:
	1.	A structured memory constrains the output to the query domain. This gives the model focus by forcing it to generate only the information we have deemed relevant for the query (via the schema (S)) to revise the memory.
	2.	Having a structured memory also assists the LLM in understanding and updating relevant information for the task. By using a structured memory, we provide flexibility in deciding how to construct the memory structure for a particular type of task, or to even automate the generation of the schema.
	3.	We output a revision (i.e., the difference between the current and next memory state) rather than the memory itself, reducing the number of tokens to decode.

3.3 Token-Efficient Memory Encoding

A significant issue with using memories is that they extend the size of the prompt (compared to having no memory) and therefore increase the number of tokens that need to be encoded. This can become a significant bottleneck when there are many chunks of information in an incremental task or if the size of the memory dominates the rest of the prompt.

One way to improve encoding efficiency is to utilize prefix KV caching [Zheng et al., 2023]. With this method, if there is a prefix of the prompt that matches a prior encoded prompt, the model can reuse the KV activations previously computed for this prefix. Thus, maximizing the length of this prefix is essential for cache efficiency. For simplicity, our experiments implement prefix KV caching such that the KV activations are reused for only the longest prefix matching the last encoded prompt.

To leverage the cache utilization improvements we introduce next, we first ensure that our prompt is KV cache-friendly. The prompt is the tuple ((T, S, m_i, d_i)). Since only (m) and (d) will change between incremental steps, there is no need to re-encode the tokens for the prefix ((T, S)). We arrange it so that the memory (m) appears before the chunk (d) rather than after. As our method produces memory revisions, which do not necessarily always overwrite the entire memory, key-value activations can be reused when encoding memory (m_i) up until the point of the first change to the memory when compared to (m_{i-1}) in the previous prompt. Reusing a substantial number of token activations would be unlikely in the usual problem formulation with natural language memories.

We now introduce a way to maximize cache utilization of the structured memory. If, instead of updating the path (p) in the memory with the new value (v), we add a new memory (which we call an amendment) containing the new value and its path directly after the existing one, then the key-value activations for everything up to the newest change can always be reused. This requires the LLM to reason more about the memory it sees by understanding that subsequent amendments with existing paths overwrite what has been seen previously. This approach of adding amendments is an alternative to maintaining a consistent in-place memory (Figure 4). It leads to a significant gain in encoding efficiency if additions to the memory are common. However, the number of tokens in the prompt increases if update operations rather than add operations are most frequent.

3.4 Generating Memory Schemas

The memory schema can be automatically generated by prompting an LLM. To do so, we hand-craft three schemas from a variety of domains, using these as few-shot examples, and prompt the LLM (Appendix C) to generate a schema for a different domain given a simple description of the query domain and an example query. For example, if the task is code retrieval, the prompt should describe the query domain (the task of retrieving a function given a code repository) and provide an example query which describes the procedure of a function as well as its inputs and outputs. The output of the LLM is then a schema that defines the structure of a memory that encodes information relevant to this task from the chunks seen by the LLM. This could be something like a map from the names of functions seen to a brief description of what the function does.

Other than this procedure of automatically generating schemas reducing the human effort required to use our approach, we hypothesize that an LLM can produce a more relevant schema for a task than what a non-expert may construct. This is useful since researchers may not be experts in each domain of interest.

4 Experiments

Datasets

We evaluate our approach with three state-of-the-art long-range datasets:
	1.	BooookScore [Chang et al., 2024]: Both a long-context book summarization dataset and benchmark. The dataset contains very large books (each over 100k tokens) which the authors ensured did not exist in the pre-training datasets of public large language models at the time of publication.
	•	We use the BooookScore metric for reference-free summarization, which computes the percentage of sentences in the summary that do not contain certain error types, measuring the coherency of final summaries.
	2.	RepoQA [Liu et al., 2024]: A long-range code understanding and retrieval benchmark. Inputs are large code repositories made up of multiple code files (above 100k tokens). The task is to retrieve a function described in natural language without naming it.
	•	We measure accuracy by checking if the named function in the model’s output exactly matches the gold reference.
	3.	LOFT-Spider [Yu et al., 2018; Lee et al., 2024]: A long-range question answering task requiring reading an entire SQL database to answer queries in natural language.
	•	We measure accuracy using exact match on the answer.

These datasets evaluate opposite boundaries in LLM reasoning: BooookScore is highly unstructured, whereas RepoQA and LOFT-Spider are well-structured reasoning tasks.

Models

To establish a quality ceiling, we compare our baselines to a state-of-the-art long context model (Gemini 1.5 Pro [Reid et al., 2024]) with a context of 1M tokens—enough to fit the longest samples from each dataset. For all other baselines, we use the same model with a 32k context. This allows us to compare similarly capable models with different context sizes. We use top-k sampling with (k=40) and temperature (0.8). For LLM-assisted schema generation, we use the same model.

Baselines
	•	Incremental merging and hierarchical merging (for BooookScore) from Chang et al. [2024]. These approaches were introduced with the BooookScore dataset to handle incremental summarization in natural language.
	•	For RepoQA (code retrieval) and LOFT-Spider, we construct new baselines by adapting incremental merging to these tasks since no official short-context baselines exist. It remains unclear how to apply hierarchical merging to these tasks.

Ablations

We explore multiple variations of PRISM:
	•	In-place memory vs. amendments (Section 3.3)
	•	Handling of add and update operations vs. only add

We encode our typed hierarchy as Python 3 dataclasses for the schema and store the memory in JSON.

Setup
	•	For BooookScore, we chunk each book into consecutive segments of 2k tokens.
	•	For RepoQA and LOFT-Spider, we use 8k-token chunks.
	•	We evaluate on 50 examples per dataset due to compute constraints, and report the mean of the dataset-specific metric with standard error over 5 LLM samples.

4.1 Structured Memories Improve Task Performance

Table 2 shows results. Our method beats both baselines—incremental and hierarchical merging—on BooookScore with statistical significance ((p < 0.02)) and nearly matches the long-context model. All PRISM variants perform similarly well, except using amendments with both add and update which slightly outperforms the others. This is a positive sign that the memory amendments can be as effective (or more so) than in-place memory.

Similar patterns arise with RepoQA and LOFT-Spider: PRISM outperforms baselines and is close to the long-context ceiling. These tasks are challenging because they require multi-file or multi-table reasoning. A schema that correctly captures the relationships among these chunks is key.

4.2 Amended Memories Are Scalably Token-Efficient

Incremental processing can require many more LLM calls than a single-step long-context approach, and in-context memories have a cost. We investigate whether our programmatic memory revisions and key-value caching optimizations produce compute efficiency benefits. We measure cache hit rate (the fraction of tokens whose KV activations could be reused) and a cost index that approximates typical API pricing. Decoding can be ~3× more expensive than encoding in popular APIs (e.g., OpenAI GPT-4, Anthropic Claude 3.5).

Table 3: PRISM variants achieve highest cache reuse, with amendments and updates especially effective (up to 69% cache hits in BooookScore vs. 0–1% for baselines). It also reduces overall cost up to 54%.

Figure 5: We vary the chunk size on RepoQA using our best variant (amendments without updates). Shorter chunks slightly lower accuracy, but net encoded tokens remain roughly constant because cache hit rate improves. The total cost remains stable across chunk sizes, allowing us to scale down without large cost increases.

4.3 LLM-Generated Schemas Compete with Hand-Crafted

While PRISM is domain-agnostic, schema design requires expertise in the task domain. We check if an LLM can generate a high-quality schema automatically. Table 4 compares LLM-generated schemas (Appendix A.2) to manual ones. Performance is similar—LLM-generated schemas match or approach expert-curated ones, showing that PRISM can be applied with minimal domain knowledge.

5 Conclusion

We presented PRISM, a method for solving long-range tasks with short-context models via an incrementally revised structured memory specified by a typed hierarchy schema. This yields better results than unstructured memory baselines—nearly matching a long-context model for a summarization task—while also being more token-efficient. Moreover, we show how to automatically generate memory schemas with an LLM, reducing human effort. Additionally, we introduced an amendment strategy to further leverage key-value caching, cutting inference cost significantly. Our method scales down context without major cost or performance loss, offering a practical solution for long-range reasoning under context constraints.

6 Limitations

While we have shown that structured memories can be task-agnostic, improve quality, and improve token-efficiency, there remain some limitations:
	1.	We explore only a few manually designed schemas. Future work could characterize how to design or discover schemas for different tasks.
	2.	Our chunk size analysis is preliminary, using a single dataset (RepoQA) and five chunk sizes. A larger set of datasets and chunk sizes would clarify potential scaling laws for token-efficiency.
	3.	Though we outperform other short-context approaches, we do not yet match long-context performance on well-structured reasoning tasks like RepoQA and LOFT-Spider.

Acknowledgments

Thanks to Michael Boratko and Zachary Fisher for comments and suggestions. DJ was a Student Researcher at Google DeepMind during this project and is also supported by an AWS Studentship from the EPSRC Centre for Doctoral Training in Autonomous Intelligent Machines and Systems (AIMS) (EP/S024050/1).

References
	•	Chang, Yapei, Kyle Lo, Tanya Goyal, and Mohit Iyyer. 2024. BooookScore: A systematic exploration of book-length summarization in the era of LLMs. In The Twelfth International Conference on Learning Representations (ICLR 2024).
	•	Fei, Weizhi, Xueyan Niu, Guoqing Xie, Yanhua Zhang, Bo Bai, Lei Deng, and Wei Han. 2024. Retrieval meets reasoning: Dynamic in-context editing for long-text understanding. CoRR, abs/2406.12331.
	•	He, Zifan, Zongyue Qin, Neha Prakriya, Yizhou Sun, and Jason Cong. 2024. HMT: Hierarchical memory transformer for long context language processing. CoRR, abs/2405.06067.
	•	Hwang, Eunjeong, Yichao Zhou, Beliz Gunel, James Bradley Wendt, and Sandeep Tata. 2024a. SUMIE: A synthetic benchmark for incremental entity summarization. CoRR, abs/2406.05079.
	•	Hwang, EunJeong, Yichao Zhou, James Bradley Wendt, Beliz Gunel, Nguyen Vo, Jing Xie, and Sandeep Tata. 2024b. Enhancing incremental summarization with structured representations. Findings of the ACL: EMNLP, abs/2407.15021.
	•	Ivgi, Maor, Uri Shaham, and Jonathan Berant. 2023. Efficient long-text understanding with short-text models. Transactions of the Association for Computational Linguistics, 11:284–299.
	•	Kwon, Woosuk, Zhuohan Li, Siyuan Zhuang, Ying Sheng, Lianmin Zheng, Cody Hao Yu, Joseph Gonzalez, Hao Zhang, and Ion Stoica. 2023. Efficient memory management for large language model serving with pagedattention. In Proceedings of the 29th Symposium on Operating Systems Principles (SOSP 2023).
	•	Lee, Jinhyuk, Anthony Chen, Zhuyun Dai, Dheeru Dua, Devendra Singh Sachan, Michael Boratko, Yi Luan, Sébastien M.R. Arnold, Vincent Perot, Siddharth Dalmia, Hexiang Hu, Xudong Lin, Panupong Pasupat, Aida Amini, Jeremy R. Cole, Sebastian Riedel, Iftekhar Naim, Ming-Wei Chang, and Kelvin Guu. 2024. Can long-context language models subsume retrieval, rag, sql, and more? CoRR, abs/2406.13121.
	•	Liu, Jiawei, Jia Le Tian, Vijay Daita, Yuxiang Wei, Yifeng Ding, Yuhan Katherine Wang, Jun Yang, and Lingming Zhang. 2024. RepoQA: Evaluating long context code understanding. CoRR, abs/2406.06025.
	•	Munkhdalai, Tsendsuren, Manaal Faruqui, and Siddharth Gopal. 2024. Leave no context behind: Efficient infinite context transformers with infiniattention. CoRR, abs/2404.07143.
	•	Packer, Charles, Vivian Fang, Shishir G. Patil, Kevin Lin, Sarah Wooders, and Joseph E. Gonzalez. 2023. MemGPT: Towards LLMs as operating systems. CoRR, abs/2310.08560.
	•	Pope, Reiner, Sholto Douglas, Aakanksha Chowdhery, Jacob Devlin, James Bradbury, Jonathan Heek, Kefan Xiao, Shivani Agrawal, and Jeff Dean. 2023. Efficiently scaling transformer inference. In Proceedings of the Sixth Conference on Machine Learning and Systems (MLSys 2023).
	•	Reid, Machel, Nikolay Savinov, Denis Teplyashin, Dmitry Lepikhin, Timothy P. Lillicrap, Jean-Baptiste Alayrac, Radu Soricut, Angeliki Lazaridou, Orhan Firat, Julian Schrittwieser, Ioannis Antonoglou, Rohan Anil, Sebastian Borgeaud, Andrew M. Dai, Katie Millican, Ethan Dyer, Mia Glaese, Thibault Sottiaux, Benjamin Lee, Fabio Viola, Malcolm Reynolds, Yuanzhong Xu, James Molloy, Jilin Chen, Michael Isard, Paul Barham, Tom Hennigan, Ross McIlroy, Melvin Johnson, Johan Schalkwyk, Eli Collins, Eliza Rutherford, Erica Moreira, Kareem Ayoub, Megha Goel, Clemens Meyer, Gregory Thornton, Zhen Yang, Henryk Michalewski, Zaheer Abbas, Nathan Schucher, Ankesh Anand, and others. 2024. Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context. CoRR, abs/2403.05530.
	•	Wang, Weizhi, Li Dong, Hao Cheng, Xiaodong Liu, Xifeng Yan, Jianfeng Gao, and Furu Wei. 2023. Augmenting language models with long-term memory. In Advances in Neural Information Processing Systems 36 (NeurIPS 2023).
	•	Yu, Tao, Rui Zhang, Kai Yang, Michihiro Yasunaga, Dongxu Wang, Zifan Li, James Ma, Irene Li, Qingning Yao, Shanelle Roman, Zilin Zhang, and Dragomir R. Radev. 2018. Spider: A large-scale human-labeled dataset for complex and cross-domain semantic parsing and text-to-sql task. In Proceedings of EMNLP 2018.
	•	Zheng, Lianmin, Liangsheng Yin, Zhiqiang Xie, Jeff Huang, Chuyue Sun, Cody Hao Yu, Shiyi Cao, Christos Kozyrakis, Ion Stoica, Joseph E. Gonzalez, Clark W. Barrett, and Ying Sheng. 2023. Efficiently programming large language models using sglang. CoRR, abs/2312.07104.

