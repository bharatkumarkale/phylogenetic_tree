from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

import os, json
from Bio import SeqIO 
import subprocess

# Create your views here.
module_path = os.path.dirname(__file__)
fasta_file_name = os.path.join(module_path, "data/yeast_combined_seqs.fa")
data = SeqIO.parse(fasta_file_name, "fasta")
full_fasta_data = {rec.id:rec for rec in data}

def index(request):
    return render(request, 'base.html')

@csrf_exempt
def runMSA(request):
    inp_lbls = json.loads(request.POST.get('labels'))
    ref_lbl = request.POST.get('ref_label')
    ref_seq = [full_fasta_data[ref_lbl]]
    inp_seqs = [full_fasta_data[lbl] for lbl in inp_lbls if lbl!=ref_lbl]
    input_fa = os.path.join(module_path, "data/input.fa")
    ref_fa = os.path.join(module_path, "data/ref.fa")
    out_fa = os.path.join(module_path, "data/output.fa")
    SeqIO.write(inp_seqs, input_fa, "fasta")
    SeqIO.write(ref_seq, ref_fa, "fasta")
    cmd_mafft = f"mafft --6merpair --thread -1 --keeplength --addfragments {input_fa} {ref_fa}"
    cmd_mafft = cmd_mafft.split(" ")
    res = subprocess.run(cmd_mafft, capture_output=True)
    output = res.stdout.decode('utf-8')
    with open(out_fa, "w") as fp:
      fp.write(output)
    mafft_res = SeqIO.parse(out_fa, "fasta")
    mafft_res = [[rec.id,str(rec.seq)] for rec in mafft_res]
    return JsonResponse({'data': json.dumps(mafft_res)})

